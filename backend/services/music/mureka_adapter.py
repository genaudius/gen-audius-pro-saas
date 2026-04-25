"""
Gen Audius Pro — Mureka AI Adapter
====================================
Adapter para Mureka AI con la misma interfaz que KieSunoAdapter.

Documentación: https://platform.mureka.ai/apiDocs
"""

import requests
import os
import time
import logging
from typing import Optional
from .base_provider import MusicProvider
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("gen_audius.mureka_adapter")


class MurekaAdapter(MusicProvider):
    """
    Adapter para Mureka AI.
    Interfaz compatible con KieSunoAdapter para uso en el ProviderManager.
    """

    BASE_URL = "https://api.mureka.ai"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("MUREKA_API_KEY", "")
        self._session = requests.Session()
        self._update_headers()

    def _update_headers(self):
        self._session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "GenAudius/9.1 (+https://genaudius.com)",
        })

    def update_api_key(self, new_key: str):
        self.api_key = new_key
        self._update_headers()
        logger.info("🔑 [MUREKA] API key hot-reloaded")

    def generate_music(
        self,
        prompt: str,
        genre: Optional[str] = None,
        lyrics: Optional[str] = None,
        voice: str = "M",
        style: Optional[str] = None,
        model: str = "auto",
        **kwargs,
    ) -> dict:
        """
        Inicia una generación en Mureka AI.
        Returns: {success: bool, task_id: str, engine: str}
        """
        if not self.api_key:
            logger.error("❌ [MUREKA] API key not configured")
            return {"success": False, "error": "MUREKA_API_KEY not set. Configure it in the Admin Panel."}

        is_instrumental = not bool(lyrics and lyrics.strip())
        vocal_gender    = "male" if voice == "M" else "female"

        payload = {
            "prompt":        prompt,
            "genre":         genre or "latin",
            "lyrics_type":   "pure_music" if is_instrumental else "lyrics",
            "vocal_gender":  vocal_gender,
        }
        if lyrics:
            payload["lyrics"] = lyrics.strip()[:3000]

        logger.info(f"🎵 [MUREKA] Submitting | Genre: {genre} | Instrumental: {is_instrumental}")

        try:
            response = self._session.post(
                f"{self.BASE_URL}/v1/song/generate",
                json=payload,
                timeout=45,
            )
            logger.info(f"🔍 [MUREKA] Status: {response.status_code}")

            try:
                data = response.json()
            except Exception:
                data = {}

            if response.status_code != 200:
                error_msg = data.get("message") or data.get("msg") or f"HTTP {response.status_code}"
                return {"success": False, "error": f"Mureka Error: {error_msg}"}

            task_id = (
                data.get("data", {}).get("id")
                or data.get("id")
                or data.get("task_id")
            )
            if not task_id:
                logger.error(f"❌ [MUREKA] No task_id in response: {data}")
                return {"success": False, "error": "No Task ID received from Mureka"}

            logger.info(f"✅ [MUREKA] Generation queued | Task: {task_id}")
            return {
                "success": True,
                "task_id": task_id,
                "status":  "processing",
                "engine":  "MUREKA",
            }

        except requests.exceptions.Timeout:
            return {"success": False, "error": "Mureka request timed out"}
        except Exception as e:
            logger.error(f"❌ [MUREKA] Unexpected error: {e}")
            return {"success": False, "error": f"Mureka internal error: {str(e)}"}

    def get_status(self, task_id: str) -> dict:
        """
        Poll generation status for a given task_id.
        Returns: {success, status: 'processing'|'complete'|'failed', audio_url?, ...}
        """
        try:
            response = self._session.get(
                f"{self.BASE_URL}/v1/song/query",
                params={"id": task_id},
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            inner  = data.get("data", {}) or {}
            status = inner.get("status") or data.get("status", "")

            if status in ("completed", "success", "SUCCESS"):
                songs    = inner.get("songs") or inner.get("tracks") or []
                audio_url = songs[0].get("audio_url") if songs else None
                image_url = songs[0].get("image_url") if songs else None
                return {
                    "success":    True,
                    "status":     "complete",
                    "audio_url":  audio_url,
                    "image_url":  image_url,
                    "task_id":    task_id,
                    "all_tracks": [
                        {"audio_url": s.get("audio_url"), "image_url": s.get("image_url")}
                        for s in songs
                    ],
                }
            elif status in ("failed", "error", "FAILED"):
                return {"success": False, "status": "failed", "task_id": task_id,
                        "error": inner.get("error", "Mureka generation failed")}
            else:
                return {"success": True, "status": "processing", "task_id": task_id}

        except Exception as e:
            logger.error(f"❌ [MUREKA FEED] Error polling {task_id}: {e}")
            return {"success": False, "status": "failed", "error": str(e)}


# ─── Singleton ────────────────────────────────────────────────────────────────
mureka_adapter = MurekaAdapter()
