"""
Gen Audius Pro - 4 Pillar Master Engine (Modal Serverless)
==========================================================
Este archivo es el núcleo monolítico desplegado en Modal. 
Contiene los 4 pilares en Clases asíncronas separadas, con diferentes 
entornos (Images) de Docker para evitar cuellos de botella en memoria, 
garantizando que el LLM, el Diseñador Visual y el Motor Musical 
corran en paralelo de forma óptima.
"""

import modal
import os
import time
import sys

# Ensure Modal workers can print unicode (emojis) safely.
# Some Modal runtime environments default to a non-UTF8 console encoding, which can crash tasks.
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# --- INICIALIZACIÓN ---
app = modal.App("gen-audius-master-studio")

# --- VOLÚMENES Y SECRETOS ---
# Volumen seguro donde alojaremos tus Datasets Originales y MIDI
dataset_vol = modal.Volume.from_name("gen-audius-dataset-vol", create_if_missing=True)
gau_ckpt_vol = modal.Volume.from_name("genaudius-v1-sao-ckpt", create_if_missing=True)

# Secretos (Token de Seguridad, HuggingFace, R2)
secrets = [modal.Secret.from_name("gen-audius-secrets")]

# Diccionario de estados en tiempo real para la UI
task_status_dict = modal.Dict.from_name("gen-audius-task-status", create_if_missing=True)

def upload_to_r2(local_file_path: "str", remote_file_name: "str") -> "str":
    """
    Sube un archivo renderizado a Cloudflare R2.
    Devuelve la URL pública para el reproductor Frontend.
    """
    import os
    import boto3
    
    # Extraemos del secreto que acabas de configurar
    ak = os.getenv("AWS_ACCESS_KEY_ID")
    sk = os.getenv("AWS_SECRET_ACCESS_KEY")
    
    # Endpoint de tu cuenta específica
    endpoint = os.getenv("R2_ENDPOINT_URL", "https://a1d6cb68f850a272e9e14ae22a3b3e0e.r2.cloudflarestorage.com")
    bucket = os.getenv("R2_BUCKET_NAME", "gen-audius-assets")
    public_base = os.getenv("R2_PUBLIC_URL", "https://MOCK_PUBLIC_DEV.r2.dev")
    
    if not ak or not sk:
        print(f"⚠️ [S3-MOCK] Falta AWS keys en secretos. Simulando subida de {remote_file_name}")
        return f"{public_base}/{remote_file_name}"

    try:
        s3 = boto3.client("s3", endpoint_url=endpoint, aws_access_key_id=ak, aws_secret_access_key=sk, region_name="auto")
        s3.upload_file(local_file_path, bucket, remote_file_name)
        print(f"☁️ [R2] Subida exitosa: {remote_file_name}")
        # Limpiar "/" extra si la URL los tiene
        return f"{public_base.rstrip('/')}/{remote_file_name}"
    except Exception as e:
        print(f"❌ [R2 ERROR] {e}")
        return f"fallback_local_{remote_file_name}"


# ==========================================
# PILAR 1: CEREBRO COMPOSITOR (LLM Experto)
# ==========================================
vllm_image = (
    modal.Image.debian_slim()
    .pip_install("transformers", "torch", "accelerate", "huggingface_hub[hf_transfer]")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_commands(
        "python -c 'from huggingface_hub import snapshot_download; snapshot_download(\"meta-llama/Meta-Llama-3.1-8B-Instruct\", ignore_patterns=[\"original/*\"])'",
        secrets=secrets
    )
)

@app.cls(image=vllm_image, gpu="A10G", timeout=600, secrets=secrets)
class GenerativeComposer:
    """Modelo de Lenguaje LLM hospedado enteramente en tu propio servidor GPU (Optimizado para inicio rápido)."""
    
    @modal.enter()
    def setup(self):
        from transformers import AutoTokenizer, AutoModelForCausalLM
        import torch
        import os
        import time
        
        start_time = time.time()
        self.model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct"
        print(f"🧠 [COMPOSER] Iniciando carga de cerebro musical: {self.model_name}...")
        
        try:
            print("⏳ [COMPOSER] Cargando Tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            
            print("⏳ [COMPOSER] Cargando Pesos del Modelo (esto puede tomar 1-2 min la primera vez)...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name, 
                torch_dtype=torch.float16,
                device_map="auto"
            )
            
            # Cargar ADN Musical
            self.dna_data = {}
            dna_path = "/data/dataset/knowledge.json"
            if os.path.exists(dna_path):
                import json
                with open(dna_path, "r") as f:
                    self.dna_data = json.load(f)
                print(f"📚 [COMPOSER] ADN cargado exitosamente.")
            
            end_time = time.time()
            print(f"✅ [COMPOSER] Motor listo en {end_time - start_time:.2f} segundos.")
            
        except Exception as e:
            print(f"❌ [COMPOSER ERROR] Fallo crítico al cargar el modelo: {e}")
            raise e

    @modal.method()
    def compose_lyrics(self, idea: str, genre: str = "Bachata") -> dict:
        """Escribe una estructura de canción profesional basada en tu ADN musical."""
        print(f"✍️ [COMPOSER] Generando letra para: {idea[:50]}...")
        dna_info = f"Tonalidades: {self.dna_data.get('detected_keys', ['Desconocida'])}"
        
        system_prompt = f"Eres el Compositor Maestro de Gen Audius. Estilo: {dna_info}. Escribe {genre} profesional."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": idea}
        ]
        
        input_ids = self.tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to("cuda")
        outputs = self.model.generate(input_ids, max_new_tokens=512, do_sample=True, temperature=0.7)
        text = self.tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
        
        # Generar descripción visual
        print("🎨 [COMPOSER] Generando descripción visual para la portada...")
        scene_prompt = f"Basado en esta letra: {text[:200]}, describe una escena visual impactante para la portada."
        scene_ids = self.tokenizer.apply_chat_template([{"role": "user", "content": scene_prompt}], add_generation_prompt=True, return_tensors="pt").to("cuda")
        scene_outputs = self.model.generate(scene_ids, max_new_tokens=100)
        scene_desc = self.tokenizer.decode(scene_outputs[0][scene_ids.shape[-1]:], skip_special_tokens=True)

        print("✨ [COMPOSER] Composición completada.")
        return {
            "status": "success",
            "lyrics": text,
            "scene_description": scene_desc
        }


# ==========================================
# PILAR 2: DISEÑADOR GRÁFICO (Portadas)
# ==========================================
vision_image = (
    modal.Image.debian_slim()
    .pip_install("diffusers", "transformers", "accelerate", "safetensors", "torch", "boto3", "huggingface_hub[hf_transfer]")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_commands(
        "python -c 'from huggingface_hub import snapshot_download; snapshot_download(\"stabilityai/stable-diffusion-xl-base-1.0\")'",
        secrets=secrets
    )
)

@app.cls(image=vision_image, gpu="A10G", timeout=600, secrets=secrets)
class ArtDesigner:
    """Motor Visual SDXL / FLUX para diseñar las portadas musicales."""
    
    @modal.enter()
    def setup(self):
        import torch
        from diffusers import StableDiffusionXLPipeline
        print("🎨 [VISION] Cargando modelo de diseño SDXL...")
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0", 
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        )
        self.pipe.to("cuda")

    @modal.method()
    def generate_cover(self, scene_description: str, style: str = "artistic") -> dict:
        """Crea la miniatura real usando SDXL con estilos Fotográfico o Artístico."""
        print(f"🖌️ [VISION] Pintando portada ({style}): {scene_description}")
        
        style_prompt = ""
        if style == "realistic":
            style_prompt = "Photorealistic, 8k, professional photography, cinematic lighting, highly detailed."
        else:
            style_prompt = "Oil painting, artistic, expressive brushstrokes, masterpiece, vibrant colors, detailed illustration."
            
        final_prompt = f"{scene_description}, {style_prompt}"
        
        image = self.pipe(final_prompt, num_inference_steps=30).images[0]
        temp_path = "/tmp/cover_gen.jpg"
        image.save(temp_path)
        
        # Subir a Cloudflare R2
        remote_name = f"covers/cover_{os.urandom(4).hex()}.jpg"
        public_url = upload_to_r2(temp_path, remote_name)
        
        return {
            "status": "success",
            "cover_url": public_url
        }


# ==========================================
# PILAR 3 Y 4: GENERADOR MUSICAL Y MASTERING
# ==========================================
audio_image = (
    modal.Image.debian_slim()
    .apt_install(
        "ffmpeg", "pkg-config", "libavformat-dev", "libavcodec-dev", "libavdevice-dev",
        "libavutil-dev", "libswscale-dev", "libswresample-dev", "libavfilter-dev"
    )
    .pip_install(
        "torch", "torchaudio",
        "audiocraft", "pedalboard", "pyloudnorm", "librosa",
        "soundfile", "boto3", "music21", "huggingface_hub[hf_transfer]"
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_commands(
        "python -c 'from huggingface_hub import snapshot_download; snapshot_download(\"facebook/musicgen-stereo-large\")'",
        secrets=secrets
    )
)

def _repo_root() -> str:
    """
    Resolve repo root for adding local files at build time.
    Modal builds run locally, so we can safely reference local filesystem here.
    """
    here = Path(__file__).resolve()
    for i in range(8):
        try:
            cand = here.parents[i]
        except IndexError:
            break
        if (cand / "data" / "model_config.json").is_file():
            return str(cand)
    return str(Path.cwd())


gau_audio_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .run_commands(
        "pip install --no-cache-dir torch==2.5.1 torchaudio==2.5.1 "
        "--index-url https://download.pytorch.org/whl/cu124",
        "git clone --depth 1 https://github.com/Stability-AI/stable-audio-tools.git /opt/sao",
        "pip install --no-cache-dir /opt/sao",
    )
    .add_local_file(str(Path(_repo_root()) / "data" / "model_config.json"), "/train_config/model_config.json")
)


@app.cls(
    image=gau_audio_image,
    gpu="A100",
    timeout=1200,
    volumes={"/checkpoints": gau_ckpt_vol},
    secrets=secrets,
)
class GauMusicEngine:
    """GenAudius (GAU) finetune engine using Stable Audio Tools."""

    @modal.enter()
    def setup(self):
        import torch

        from stable_audio_tools.models.factory import create_model_from_config
        from stable_audio_tools.models.utils import copy_state_dict, load_ckpt_state_dict

        import json
        import os

        with open("/train_config/model_config.json", encoding="utf-8") as f:
            self.model_config = json.load(f)

        # Unwrapped model checkpoint path inside the mounted volume
        self.unwrapped_path = os.environ.get(
            "GENAUDIUS_SAO_UNWRAPPED_MODEL",
            "/checkpoints/bachata_smoke_v1/exports/epoch102_step19000_unwrapped.safetensors",
        )
        self.brand_label = os.environ.get("GENAUDIUS_BRAND_LABEL", "GAU")

        print(f"🎧 [GAU] Loading finetune weights from {self.unwrapped_path} ...")
        self.model = create_model_from_config(self.model_config)
        copy_state_dict(self.model, load_ckpt_state_dict(self.unwrapped_path))
        self.model.to("cuda").eval().requires_grad_(False)
        self.model.to(torch.float16)
        self.sample_rate = int(getattr(self.model, "sample_rate", self.model_config.get("sample_rate", 44100)))
        print(f"✅ [GAU] Ready (sr={self.sample_rate}).")

    @modal.method()
    def generate(self, prompt: str, lyrics: str = "", seconds_total: float = 30.0, steps: int = 200, cfg_scale: float = 5.0) -> dict:
        import os
        import time
        import torch
        import torchaudio

        from stable_audio_tools.inference.generation import generate_diffusion_cond

        # Conditioning keys expected by stable-audio-tools
        conditioning = [
            {
                "prompt": f"{self.brand_label} {prompt}. Lyrics context: {lyrics[:120]}".strip(),
                "seconds_start": 0,
                "seconds_total": float(seconds_total),
            }
        ]

        n_samples = int(round(float(seconds_total) * self.sample_rate))
        print(f"🚀 [GAU] Generating {seconds_total}s | steps={steps} cfg={cfg_scale}")
        audio = generate_diffusion_cond(
            self.model,
            steps=int(steps),
            cfg_scale=float(cfg_scale),
            conditioning=conditioning,
            batch_size=1,
            sample_size=n_samples,
            seed=-1,
            device="cuda",
        )

        wav = audio[0].detach().to(torch.float32).clamp(-1, 1).cpu()
        tmp = f"/tmp/gau_{os.urandom(4).hex()}.wav"
        torchaudio.save(tmp, wav, self.sample_rate)

        remote_name = f"tracks/gau_{int(time.time())}_{os.urandom(3).hex()}.wav"
        public_url = upload_to_r2(tmp, remote_name)
        return {"status": "success", "audio_url": public_url, "duration": float(seconds_total)}


@app.cls(image=audio_image, gpu="A100", timeout=1200, volumes={"/data/dataset": dataset_vol}, secrets=secrets)
class MusicEngine:
    """Motor AudioCraft con compresión de Mastering incorporada y acceso al Dataset Puro."""
    
    @modal.enter()
    def setup(self):
        print("🎧 [AUDIO] Inicializando MusicGen y motor de Mastering...")
        from audiocraft.models import MusicGen
        self.model = MusicGen.get_pretrained('facebook/musicgen-stereo-large')
        self.model.set_generation_params(duration=30)
        
    @modal.method()
    def analyze_and_store_midi(self):
        """
        Logic original de tu notebook: Procesa el dataset MIDI y crea una base de conocimiento.
        """
        from music21 import converter, stream
        import os

        dataset_dir = "/data/dataset"
        note_seq = stream.Score()
        
        print(f"📂 [MIDI-BRAIN] Escaneando volumen en busca de MIDIs...")
        
        found_files = 0
        for root, dirs, files in os.walk(dataset_dir):
            for file_path in files:
                ext = file_path.lower()
                if ext.endswith(".mid") or ext.endswith(".midi"):
                    # Evitar procesar el archivo de salida si ya existe
                    if "preprocessed_knowledge.mid" in file_path:
                        continue
                        
                    try:
                        full_path = os.path.join(root, file_path)
                        midi_stream = converter.parse(full_path)
                        
                        # music21 fix: usar .flatten() en lugar de .flat
                        for n in midi_stream.flatten().notes:
                            note_seq.append(n)
                            
                        found_files += 1
                        if found_files % 10 == 0:
                            print(f"✅  Procesados {found_files} archivos...")
                    except Exception as e:
                        print(f"❌  Error en {file_path}: {e}")
                else:
                    # Debug: Ver qué archivos se están ignorando
                    if not file_path.startswith("."):
                         print(f"➖ Ignorado (no es MIDI): {file_path}")

        print(f"📊 [MIDI-BRAIN] Análisis completado. Total archivos MIDI procesados: {found_files}")

        # --- Extracción de Inteligencia Musical (DNA) ---
        musical_dna = {
            "total_files": found_files,
            "detected_keys": [],
            "average_tempo": 0,
            "instruments": []
        }
        
        try:
            print("🧠 [MIDI-BRAIN] Extrayendo ADN musical profundo...")
            # Analizar tonalidad predominante
            key = note_seq.analyze('key')
            musical_dna["detected_keys"].append(str(key))
            
            # Intentar obtener tempo promedio (si existe)
            # musical_dna["average_tempo"] = note_seq.metronomeMarkBoundaries()[0][2].number
        except Exception as e:
            print(f"⚠️  No se pudo extraer DNA detallado: {e}")

        # Guardar el resultado MIDI
        output_path = os.path.join(dataset_dir, "preprocessed_knowledge.mid")
        note_seq.write("midi", output_path)
        
        # Guardar el resultado JSON para el LLM
        json_path = os.path.join(dataset_dir, "knowledge.json")
        import json
        with open(json_path, "w") as f:
            json.dump(musical_dna, f, indent=4)
            
        print(f"💾 [MIDI-BRAIN] ADN guardado en: {output_path} y {json_path}")
        
        return {"status": "success", "midi": output_path, "dna": json_path}

    @modal.method()
    def generate_and_master(self, prompt: str, lyrics: str) -> dict:
        """El generador absoluto que usa la letra y el estilo, mezclado y masterizado por IA."""
        import scipy.io.wavfile as wav
        import numpy as np
        from pedalboard import Pedalboard, Compressor, Gain, Limiter, HighpassFilter
        
        print(f"🚀 [AUDIO] Generando Track usando directrices: {prompt}")
        audio_tensor = self.model.generate([f"{prompt}. Lyrics context: {lyrics[:100]}"], progress=True)
        audio_data = audio_tensor[0].cpu().numpy() # [channels, samples]
        
        # MusicGen output is often mono or stereo at 32kHz
        sample_rate = 32000
        
        print("🔊 [MASTERING] Aplicando cadena de masterización Gen Audius...")
        board = Pedalboard([
            HighpassFilter(cutoff_frequency_hz=40),
            Compressor(threshold_db=-18, ratio=4),
            Gain(gain_db=2),
            Limiter(threshold_db=-0.1)
        ])
        
        # Pedalboard espera [samples, channels]
        audio_ready = np.transpose(audio_data)
        mastered = board(audio_ready, sample_rate)
        
        temp_audio = "/tmp/gen_track.wav"
        wav.write(temp_audio, sample_rate, mastered)
        
        # Subir a Cloudflare R2
        remote_name = f"tracks/track_{os.urandom(4).hex()}.wav"
        public_url = upload_to_r2(temp_audio, remote_name)
        
        return {
            "status": "success",
            "audio_url": public_url,
            "duration": 30
        }


# ==========================================
# ORQUESTADOR (FastAPI Webhooks de Entrada)
# ==========================================
@app.function(image=audio_image, timeout=1200, volumes={"/data/dataset": dataset_vol}, secrets=secrets)
def maestro_task(prompt: str, genre: str = "Bachata", lyrics_provided: str = "", visual_style: str = "artistic", task_id: str = "") -> dict:
    """
    Función de fondo ultra-resistente con paralelismo total y timeouts estrictos.
    """
    import traceback
    import time
    print(f"[TASK] 🚀 Iniciando Gen Maestro en paralelo para: {prompt}")
    
    try:
        # 1. Preparación de tareas
        lyrics_task = None
        cover_task = None
        audio_task = None
        
        composer = GenerativeComposer()
        designer = ArtDesigner()
        engine = GauMusicEngine()
        
        # Lanzar Letra si no se provee
        if not lyrics_provided:
            print("🧠 [TASK] Lanzando tarea de Letra (A10G)...")
            lyrics_task = composer.compose_lyrics.spawn(prompt, genre)
        
        # Lanzar Portada y Audio al mismo tiempo
        print("🎨 [TASK] Lanzando tarea de Portada (A10G)...")
        cover_task = designer.generate_cover.spawn(prompt, visual_style)
        
        # Actualizar estado inicial
        if task_id: 
            task_status_dict[task_id] = {
                "status": "processing", 
                "progress": 10, 
                "message": "Orquestando IA: Letra, Portada y Audio en paralelo..."
            }

        # 2. Obtener Letras (Timeout corto 60s)
        lyrics = lyrics_provided
        if lyrics_task:
            try:
                print("⏳ [TASK] Esperando Letra (max 60s)...")
                composition = lyrics_task.get(timeout=60)
                lyrics = composition.get("lyrics", "")
                print("✅ [TASK] Letra recibida.")
            except Exception as e:
                print(f"⚠️ [TASK] Timeout/Error en letra, usando fallback: {e}")
                lyrics = f"Una canción de {genre} sobre {prompt}..."
        
        # 3. Lanzar Audio ahora que tenemos la letra (o el fallback)
        print("🎵 [TASK] Lanzando tarea de Audio GAU (A100)...")
        audio_task = engine.generate.spawn(prompt, lyrics)
        
        if task_id: 
            task_status_dict[task_id] = {
                "status": "recording", 
                "progress": 40, 
                "message": "Letra lista. Generando audio de alta fidelidad en A100...",
                "lyrics": lyrics[:150] + "..."
            }

        # 4. Obtener Portada (Timeout 120s)
        cover_url = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"
        if cover_task:
            try:
                print("⏳ [TASK] Esperando Portada...")
                cover = cover_task.get(timeout=120)
                cover_url = cover.get("cover_url")
                print("✅ [TASK] Portada lista.")
            except Exception as e:
                print(f"⚠️ [TASK] Error en portada: {e}")

        if task_id: 
            task_status_dict[task_id] = {
                "status": "recording", 
                "progress": 70, 
                "message": "Renderizando audio final...",
                "image_url": cover_url
            }

        # 5. Obtener Audio (Timeout 600s)
        audio_url = None
        if audio_task:
            try:
                print("⏳ [TASK] Esperando Audio (A100)...")
                track = audio_task.get(timeout=600)
                audio_url = track.get("audio_url")
                print("✅ [TASK] Audio listo.")
            except Exception as e:
                print(f"❌ [TASK] Error fatal en MusicEngine: {e}")
                raise Exception(f"Fallo en motor de audio: {str(e)}")

        result = {
            "success": True,
            "status": "complete",
            "lyrics": lyrics,
            "image_url": cover_url,
            "audio_url": audio_url,
            "title": prompt[:30],
            "message": "Hit generado con éxito!"
        }
        
        if task_id: task_status_dict[task_id] = result
        print(f"✨ [TASK] {task_id} COMPLETADA.")
        return result

    except Exception as e:
        error_msg = str(e)
        print(f"🔥 [TASK ERROR] {error_msg}")
        import traceback
        traceback.print_exc()
        if task_id:
            task_status_dict[task_id] = {
                "status": "failed",
                "progress": 100,
                "message": f"Error: {error_msg}",
                "error": error_msg
            }
        return {"success": False, "error": error_msg}

def _build_web_app():
    """
    Build the FastAPI app lazily.

    Important: this module is imported under multiple Modal images (LLM, vision, audio).
    Those images don't necessarily include FastAPI, so we must avoid importing it at module import time.
    """
    from fastapi import FastAPI

    web_app = FastAPI()

    @web_app.post("/api/v1/generate")
    async def generate_v1(payload: dict):
        """API V1 compatible con KIE."""
        import time

        prompt = payload.get("prompt", "")
        genre = payload.get("genre") or payload.get("style", "Bachata")
        lyrics = payload.get("lyrics", "")
        visual_style = payload.get("visual_style", "artistic")
        _title = payload.get("title", f"Gen Audius {int(time.time())}")  # preserved for compatibility
        tid = payload.get("task_id") or f"task_{os.urandom(4).hex()}"

        maestro_task.spawn(prompt, genre, lyrics, visual_style, task_id=tid)

        return {
            "code": 200,
            "success": True,
            "data": {"taskId": tid, "status": "processing"},
            "message": "Generación iniciada.",
        }

    @web_app.get("/api/v1/status")
    async def status_v1(task_id: str):
        if task_id in task_status_dict:
            data = task_status_dict[task_id]
            return {
                "code": 200,
                "success": True,
                "data": data,
                "status": data.get("status", "unknown"),
            }
        return {"code": 404, "success": False, "error": "Task not found"}

    @web_app.post("/api/v1/lyrics/generate")
    async def lyrics_v1(payload: dict):
        prompt = payload.get("prompt", "")
        genre = payload.get("genre", "Bachata")
        print(f"📡 [ORCHESTRATOR] Peticion de letras recibida: {prompt[:30]}...")
        composer = GenerativeComposer()
        res = composer.compose_lyrics.remote(prompt, genre)
        return {
            "code": 200,
            "success": True,
            "data": {"lyrics": res.get("lyrics"), "title": prompt[:30]},
        }

    @web_app.post("/api/v1/separate")
    async def separate_v1(payload: dict):
        tid = f"stem_{os.urandom(4).hex()}"
        return {"code": 200, "success": True, "data": {"taskId": tid, "message": "Separación iniciada"}}

    @web_app.post("/api/v1/extend")
    async def extend_v1(payload: dict):
        tid = f"ext_{os.urandom(4).hex()}"
        return {"code": 200, "success": True, "data": {"taskId": tid, "message": "Extensión iniciada"}}

    @web_app.post("/api/v1/cover")
    async def cover_v1(payload: dict):
        tid = f"cov_{os.urandom(4).hex()}"
        return {"code": 200, "success": True, "data": {"taskId": tid, "message": "Cover iniciado"}}

    return web_app

@app.function(image=modal.Image.debian_slim().pip_install("fastapi[standard]"), timeout=600)
@modal.asgi_app()
def orchestrator():
    return _build_web_app()

# ==========================================
# UTILIDADES DE TERMINAL (Local Entrypoints)
# ==========================================
@app.local_entrypoint()
def run_midi_learning():
    """
    Ejecuta este comando para procesar tu dataset MIDI:
    > modal run backend/engine/modal_pro_engine.py
    """
    print("🧠 [LOCAL] Iniciando proceso de aprendizaje MIDI en la nube...")
    engine = MusicEngine()
    result = engine.analyze_and_store_midi.remote()
    print(f"✨ [LOCAL] Proceso finalizado. Resultado: {result}")
