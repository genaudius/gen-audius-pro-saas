from abc import ABC, abstractmethod
from typing import Optional

class MusicProvider(ABC):
    """
    Clase base abstracta para todos los proveedores de música (KIE, Mureka, Modal, etc.)
    Asegura que todos tengan la misma firma de métodos para el ProviderManager.
    """

    @abstractmethod
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
        raise NotImplementedError("Subclasses must implement generate_music")

    @abstractmethod
    def get_status(self, task_id: str) -> dict:
        raise NotImplementedError("Subclasses must implement get_status")

    def generate_lyrics(self, theme: str, **kwargs) -> dict:
        """Optional: Generate lyrics for a given theme."""
        return {"success": False, "error": "This provider does not support lyrics generation"}

    def separate_stems(self, audio_url: str, **kwargs) -> dict:
        """Optional: Separate vocals and instruments from an audio URL."""
        return {"success": False, "error": "This provider does not support stem separation"}

    def update_api_key(self, new_key: str):
        """Optional: Update API key in runtime."""
        pass
