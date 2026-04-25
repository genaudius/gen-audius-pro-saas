import logging
import os
import subprocess
import time
from pathlib import Path
from typing import Optional

from .base_provider import MusicProvider

logger = logging.getLogger("gen_audius.sao_modal_adapter")


class SaoModalAdapter(MusicProvider):
    """
    Stable Audio Open finetune generation via Modal CLI.

    Implementation strategy (dev-friendly):
    - Run the Modal entrypoint that generates WAVs into the Modal Volume.
    - Download the resulting WAV into backend `static/exports/`.
    - Return an `audio_url` served by FastAPI static mount.

    This keeps the frontend flow unchanged: it calls `/api/music/generate` with `provider="sao"`.
    """

    def __init__(
        self,
        volume_name: Optional[str] = None,
        unwrapped_model_path: Optional[str] = None,
        brand_label: str = "GEN::",
    ):
        self.volume_name = volume_name or os.getenv(
            "GENAUDIUS_GAU_VOLUME",
            os.getenv("GENAUDIUS_SA0_VOLUME", "genaudius-v1-sao-ckpt"),
        )
        self.unwrapped_model_path = unwrapped_model_path or os.getenv(
            "GENAUDIUS_SAO_UNWRAPPED_MODEL",
            "/checkpoints/bachata_smoke_v1/exports/epoch102_step19000_unwrapped.safetensors",
        )
        self.brand_label = os.getenv("GENAUDIUS_BRAND_LABEL", brand_label)

    def update_api_key(self, new_key: str):
        # Not used; Modal CLI auth is handled by local profile.
        return

    def get_status(self, task_id: str) -> dict:
        # This adapter runs synchronously and returns a complete result immediately.
        # We still implement get_status to satisfy the provider interface.
        return {
            "success": True,
            "status": "complete",
            "task_id": task_id,
            "engine": "GAU",
        }

    def generate_music(
        self,
        prompt: str,
        genre: Optional[str] = None,
        lyrics: Optional[str] = None,
        voice: str = "M",
        style: Optional[str] = None,
        model: Optional[str] = None,
        title: Optional[str] = None,
        **kwargs,
    ) -> dict:
        seconds_total = float(kwargs.get("seconds_total") or 30.0)
        steps = int(kwargs.get("steps") or 150)
        cfg_scale = float(kwargs.get("cfg_scale") or 6.0)
        seed = int(kwargs.get("seed") or -1)

        # Where in the Modal Volume to write (and later fetch from)
        out_dir = str(kwargs.get("out_dir") or "bachata_smoke_v1/samples")

        repo_root = Path(__file__).resolve().parents[3]  # .../backend/services/music -> .../gen-audius-pro-main
        gen_script = repo_root / "tools" / "dataset_pipeline" / "gau_generate_modal.py"

        if not gen_script.exists():
            return {"success": False, "error": f"Missing generator script: {gen_script}"}

        # Run Modal generation (writes into the volume).
        cmd = [
            "modal",
            "run",
            str(gen_script),
            "--unwrapped-model-path",
            self.unwrapped_model_path,
            "--out-dir",
            out_dir,
            "--label",
            self.brand_label,
            "--prompt",
            prompt,
            "--seconds-total",
            str(seconds_total),
            "--steps",
            str(steps),
            "--cfg-scale",
            str(cfg_scale),
            "--seed",
            str(seed),
        ]

        logger.info(f"🎛️ [SAO] Generating via Modal (out_dir={out_dir})")
        r = subprocess.run(cmd, cwd=str(repo_root), capture_output=True, text=True)
        if r.returncode != 0:
            logger.error(f"❌ [SAO] modal run failed: {r.stderr.strip()}")
            return {"success": False, "error": "SAO Modal generation failed. Check backend logs."}

        # Parse the produced file path from stdout (the script prints a dict with 'files')
        stdout = r.stdout or ""
        produced_path = None
        for line in reversed(stdout.splitlines()):
            if "/checkpoints/" in line and ".wav" in line:
                # naive but robust enough for our printed dict
                produced_path = line.split("'")[1] if "'" in line else None
                break
        if not produced_path:
            # fallback: list dir and take newest file by downloading the first match later
            produced_path = None

        # If we couldn't parse, list the folder and pick the last entry (Modal prints JSON).
        if not produced_path:
            ls_cmd = ["modal", "volume", "ls", self.volume_name, f"/{out_dir.strip().lstrip('/')}", "--json"]
            ls = subprocess.run(ls_cmd, cwd=str(repo_root), capture_output=True, text=True)
            if ls.returncode != 0:
                return {"success": False, "error": "SAO generated but cannot list output directory."}
            try:
                import json as _json

                items = _json.loads(ls.stdout or "[]")
                wavs = [it["Filename"] for it in items if str(it.get("Filename", "")).endswith(".wav")]
                if not wavs:
                    return {"success": False, "error": "SAO generated but no WAV found in volume."}
                produced_path = "/" + max(wavs, key=len).lstrip("/")  # pick something stable
            except Exception:
                return {"success": False, "error": "SAO generated but could not parse volume listing."}

        # Download from Modal Volume into backend static directory
        static_dir = repo_root / "static" / "exports"
        static_dir.mkdir(parents=True, exist_ok=True)
        timestamp = int(time.time())
        safe_title = (title or "gen_track").strip().replace(" ", "_")[:60] or "gen_track"
        local_name = f"gen_sao_{safe_title}_{timestamp}.wav"
        local_path = static_dir / local_name

        get_cmd = ["modal", "volume", "get", self.volume_name, produced_path, str(local_path)]
        get = subprocess.run(get_cmd, cwd=str(repo_root), capture_output=True, text=True)
        if get.returncode != 0 or not local_path.exists():
            logger.error(f"❌ [SAO] modal volume get failed: {get.stderr.strip()}")
            return {"success": False, "error": "Generated, but failed to download WAV from Modal volume."}

        # Return a direct URL served by backend static mount
        # Backend mounts /static -> ./static (relative to backend working dir)
        return {
            "success": True,
            "task_id": f"sao_{timestamp}",
            "status": "complete",
            "engine": "GAU",
            "audio_url": f"http://127.0.0.1:8005/static/exports/{local_name}",
            "title": title or f"GEN:: {genre or 'Track'}",
        }


sao_modal_adapter = SaoModalAdapter()

