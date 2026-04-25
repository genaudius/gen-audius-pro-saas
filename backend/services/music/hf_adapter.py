import os
import requests
import logging
from typing import Optional
from .base_provider import MusicProvider

logger = logging.getLogger("gen_audius.hf_adapter")

class HuggingFaceAdapter(MusicProvider):
    """
    Adaptador para generar contenido (letras/conceptos) usando el 
    OpenAI-compatible router de Hugging Face.
    """
    def __init__(self):
        self.api_key = os.getenv("HF_API_KEY")
        self.model = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
        self.base_url = "https://router.huggingface.co/v1"

    def generate_music(self, prompt: str, **kwargs) -> dict:
        return {"success": False, "error": "Hugging Face router only supports text generation (lyrics)"}

    def get_status(self, task_id: str) -> dict:
        return {"success": False, "error": "Synchronous API, no status needed"}

    def generate_lyrics(self, theme: str, genre: str = "Bachata", lang: str = "es", **kwargs) -> dict:
        """
        Genera letras usando Llama 3.1 vía Hugging Face Router.
        """
        if not self.api_key:
            return {"success": False, "error": "HF_API_KEY not configured"}

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            system_prompt = f"Eres un compositor experto en música latina. Escribe una canción de {genre} en idioma {lang}. Estructura: Intro, Versos, Coro, Outro."
            user_prompt = f"Tema de la canción: {theme}\n\nEscribe la letra completa:"

            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1024
            }

            response = requests.post(f"{self.base_url}/chat/completions", headers=headers, json=payload, timeout=30)
            
            if response.status_code != 200:
                return {"success": False, "error": f"HF Error {response.status_code}: {response.text}"}

            data = response.json()
            lyrics = data["choices"][0]["message"]["content"]
            
            return {
                "success": True,
                "lyrics": lyrics,
                "provider": "huggingface"
            }
        except Exception as e:
            logger.error(f"❌ [HF-LYRICS] Error: {e}")
            return {"success": False, "error": str(e)}

    def update_api_key(self, new_key: str):
        self.api_key = new_key

hf_adapter = HuggingFaceAdapter()
