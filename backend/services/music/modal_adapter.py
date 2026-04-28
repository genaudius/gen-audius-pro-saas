import requests
import os
import logging
from typing import Optional
from .base_provider import MusicProvider

logger = logging.getLogger("gen_audius.modal_adapter")


class ModalMusicAdapter(MusicProvider):
    """
    Adapter for Gen Audius Serverless Engine on Modal.com.
    Connects to: https://dagrabastudio--gen-audius-master-studio-orchestrator.modal.run
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or os.getenv("MODAL_API_KEY", "")
        self.base_url = (base_url or os.getenv("MODAL_API_URL", "")).rstrip("/")
        if not self.base_url:
            self.base_url = "https://dagrabastudio--gen-audius-master-studio-orchestrator.modal.run"
        self._session = requests.Session()
        self._update_headers()

    def _update_headers(self):
        self._session.headers.update({
            "Content-Type": "application/json",
            "X-GenAudius-Key": self.api_key,
        })

    def update_api_key(self, new_key: str):
        self.api_key = new_key
        self._update_headers()

    def generate_music(
        self,
        prompt: str,
        genre: Optional[str] = None,
        lyrics: Optional[str] = None,
        voice: str = "M",
        style: Optional[str] = None,
        model: Optional[str] = None,
        title: Optional[str] = None,
        **kwargs
    ) -> dict:
        if not self.api_key:
            return {"success": False, "error": "Modal API key not configured"}

        # Use a consistent task_id — we send it to Modal so polling works
        task_id = kwargs.get("task_id") or f"gen_{os.urandom(4).hex()}"

        payload = {
            "prompt": prompt,
            "genre": genre or "Bachata",
            "lyrics": lyrics or "",
            "voice": voice,                          # Modal expects "voice" not "vocalGender"
            "visual_style": style or "artistic",
            "title": title or f"Track {task_id}",
            "task_id": task_id,                      # Send our task_id so Modal uses it
        }

        logger.info(f"🎵 [MODAL] Submitting task {task_id} → {self.base_url}/api/v1/generate")

        try:
            response = self._session.post(
                f"{self.base_url}/api/v1/generate",
                json=payload,
                timeout=30,   # Short — Modal responds immediately (async job)
            )

            if response.status_code == 429:
                return {"success": False, "error": "Modal rate limit reached"}

            if response.status_code != 200:
                logger.error(f"❌ [MODAL] HTTP {response.status_code}: {response.text[:200]}")
                return {"success": False, "error": f"Modal Error: {response.status_code}"}

            data = response.json()
            # Modal returns {"data": {"taskId": "..."}} — normalize to our task_id
            modal_task_id = (
                data.get("data", {}).get("taskId")
                or data.get("task_id")
                or task_id
            )

            logger.info(f"✅ [MODAL] Task accepted — modal_id={modal_task_id}, our_id={task_id}")

            return {
                "success": True,
                "task_id": task_id,          # Use OUR id for consistent polling
                "modal_task_id": modal_task_id,
                "status": "processing",
                "engine": "MODAL",
                "audio_url": None,
                "image_url": None,
                "title": title,
            }

        except requests.Timeout:
            logger.error("❌ [MODAL] Timeout on generate request")
            return {"success": False, "error": "Modal timeout — server may be cold starting"}
        except Exception as e:
            logger.error(f"❌ [MODAL] Unexpected error: {e}")
            return {"success": False, "error": str(e)}

    def get_status(self, task_id: str) -> dict:
        """Poll Modal for task status. Handles nested response structure."""
        try:
            response = self._session.get(
                f"{self.base_url}/api/v1/status",
                params={"task_id": task_id},
                timeout=15,
            )

            if response.status_code == 404:
                # Task not found yet — still processing (cold start)
                return {"success": True, "status": "processing", "progress": 5}

            if response.status_code != 200:
                return {"success": False, "status": "failed", "error": f"HTTP {response.status_code}"}

            raw = response.json()
            # Modal wraps: {"code": 200, "data": {"status": "...", "audio_url": "..."}}
            data = raw.get("data", raw)
            status = data.get("status") or raw.get("status", "processing")

            if status in ("complete", "success", "completed"):
                audio_url = data.get("audio_url")
                image_url = data.get("image_url") or data.get("cover_url")
                logger.info(f"✅ [MODAL] Task {task_id} complete — audio={audio_url}")
                return {
                    "success": True,
                    "status": "complete",
                    "audio_url": audio_url,
                    "image_url": image_url,
                    "lyrics": data.get("lyrics"),
                    "title": data.get("title"),
                }
            elif status == "failed":
                error = data.get("error") or data.get("message", "Generation failed")
                logger.error(f"❌ [MODAL] Task {task_id} failed: {error}")
                return {"success": False, "status": "failed", "error": error}
            else:
                # Still processing — return progress
                return {
                    "success": True,
                    "status": "processing",
                    "progress": data.get("progress", 10),
                    "message": data.get("message", "Generando..."),
                }

        except requests.Timeout:
            # Timeout on status check is not fatal — just try again next poll
            return {"success": True, "status": "processing", "progress": 10}
        except Exception as e:
            logger.error(f"❌ [MODAL-POLL] Error: {e}")
            return {"success": False, "status": "failed", "error": str(e)}

    def generate_lyrics(self, theme: str, genre: str = "Bachata", **kwargs) -> dict:
        try:
            response = self._session.post(
                f"{self.base_url}/api/v1/lyrics/generate",
                json={"prompt": theme, "genre": genre},
                timeout=60,
            )
            if response.status_code != 200:
                return {"success": False, "error": f"HTTP {response.status_code}"}
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}


# Singleton
modal_adapter = ModalMusicAdapter()
