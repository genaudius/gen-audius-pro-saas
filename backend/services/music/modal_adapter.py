import requests
import os
import logging
from typing import Optional
from .base_provider import MusicProvider

logger = logging.getLogger("gen_audius.modal_adapter")

class ModalMusicAdapter(MusicProvider):
    """
    Adapter for Gen Audius Serverless Engine on Modal.com.
    Updated to match KIE structure.
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or os.getenv("MODAL_API_KEY", "")
        # Actualizamos la URL base por defecto para incluir el prefijo de la API si no viene en el env
        self.base_url = base_url or os.getenv("MODAL_API_URL", "https://dagrabastudio--gen-audius-master-studio-orchestrator.modal.run")
        self._session = requests.Session()
        self._update_headers()

    def _update_headers(self):
        self._session.headers.update({
            "Content-Type": "application/json",
            "X-GenAudius-Key": self.api_key,
        })

    def update_api_key(self, new_key: str):
        """Actualiza la API Key en caliente."""
        self.api_key = new_key
        self._update_headers()
        logger.info("🔑 [MODAL] API key hot-reloaded successfully")

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
        """
        Submits a generation request to the Modal engine using the unified V1 API.
        """
        if not self.api_key:
            logger.error("❌ [MODAL] API key not configured")
            return {"success": False, "error": "Modal API key not configured"}

        task_id = kwargs.get("task_id") or f"gen_{os.urandom(4).hex()}"

        # Payload compatible con la nueva estructura genérica
        payload = {
            "prompt": prompt,
            "genre": genre or "Bachata",
            "lyrics": lyrics or "",
            "vocalGender": "m" if voice == "M" else "f",
            "visual_style": style or "artistic",
            "model": model or "V5",
            "title": title or f"Track {task_id}",
            "task_id": task_id
        }

        logger.info(f"🎵 [MODAL] Submitting task {task_id}")

        try:
            # Apuntamos al nuevo endpoint unificado
            endpoint = "/api/v1/generate"
            target_url = f"{self.base_url.rstrip('/')}{endpoint}"
            
            response = self._session.post(target_url, json=payload, timeout=300)
            
            if response.status_code == 429:
                return {"success": False, "error": "Modal Billing Limit Reached."}
            
            if response.status_code != 200:
                logger.error(f"❌ [MODAL] Error {response.status_code}: {response.text}")
                return {"success": False, "error": f"Modal Error: {response.status_code}"}

            data = response.json()
            
            return {
                "success": True,
                "task_id": data.get("task_id") or task_id,
                "status": data.get("status", "processing"),
                "engine": "MODAL",
                "audio_url": data.get("audio_url"),
                "image_url": data.get("image_url"),
                "title": data.get("title")
            }

        except Exception as e:
            logger.error(f"❌ [MODAL] Unexpected error: {e}")
            return {"success": False, "error": str(e)}

    def get_status(self, task_id: str) -> dict:
        """
        Consulta el estado de una tarea asíncrona en Modal usando el endpoint V1.
        """
        try:
            endpoint = "/api/v1/status"
            target_url = f"{self.base_url.rstrip('/')}{endpoint}"
            
            response = self._session.get(f"{target_url}?task_id={task_id}", timeout=60)
            
            if response.status_code != 200:
                return {"success": False, "status": "failed", "error": f"Cloud Error {response.status_code}"}
            
            return response.json()
        except Exception as e:
            logger.error(f"❌ [MODAL-POLL] Error: {e}")
            return {"success": False, "status": "failed", "error": str(e)}

    def generate_lyrics(self, theme: str, genre: str = "Bachata", **kwargs) -> dict:
        """
        Clon del endpoint de letras de KIE.
        """
        try:
            endpoint = "/api/v1/lyrics/generate"
            target_url = f"{self.base_url.rstrip('/')}{endpoint}"
            
            payload = {"prompt": theme, "genre": genre}
            response = self._session.post(target_url, json=payload, timeout=300)
            
            if response.status_code != 200:
                return {"success": False, "error": f"Cloud Error {response.status_code}"}
            
            return response.json()
        except Exception as e:
            logger.error(f"❌ [MODAL-LYRICS] Error: {e}")
            return {"success": False, "error": str(e)}

    def separate_stems(self, audio_url: str) -> dict:
        """
        Clon del endpoint de separación de stems de KIE.
        """
        try:
            endpoint = "/api/v1/separate"
            target_url = f"{self.base_url.rstrip('/')}{endpoint}"
            
            payload = {"audio_url": audio_url}
            response = self._session.post(target_url, json=payload, timeout=60)
            
            if response.status_code != 200:
                return {"success": False, "error": f"Cloud Error {response.status_code}"}
            
            return response.json()
        except Exception as e:
            logger.error(f"❌ [MODAL-STEMS] Error: {e}")
            return {"success": False, "error": str(e)}

    def extend_audio(self, audio_url: str, prompt: str) -> dict:
        """
        Clon del endpoint de extensión de música de KIE.
        """
        try:
            endpoint = "/api/v1/extend"
            target_url = f"{self.base_url.rstrip('/')}{endpoint}"
            
            payload = {"audio_url": audio_url, "prompt": prompt}
            response = self._session.post(target_url, json=payload, timeout=60)
            
            if response.status_code != 200:
                return {"success": False, "error": f"Cloud Error {response.status_code}"}
            
            return response.json()
        except Exception as e:
            logger.error(f"❌ [MODAL-EXTEND] Error: {e}")
            return {"success": False, "error": str(e)}

    def cover_audio(self, audio_url: str, style: str) -> dict:
        """
        Clon del endpoint de cover de KIE.
        """
        try:
            endpoint = "/api/v1/cover"
            target_url = f"{self.base_url.rstrip('/')}{endpoint}"
            
            payload = {"audio_url": audio_url, "style": style}
            response = self._session.post(target_url, json=payload, timeout=60)
            
            if response.status_code != 200:
                return {"success": False, "error": f"Cloud Error {response.status_code}"}
            
            return response.json()
        except Exception as e:
            logger.error(f"❌ [MODAL-COVER] Error: {e}")
            return {"success": False, "error": str(e)}

# Singleton instance
modal_adapter = ModalMusicAdapter()
