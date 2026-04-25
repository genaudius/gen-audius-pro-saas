"""
Gen Audius Pro — Mastering Generic Adapter
===========================================
Generic adapter pattern for AI mastering services.
Primary: Masterchannel API  |  Fallback: Built-in analysis profile

Architecture:
  - Implements the same interface contract as kie_suno_adapter
  - Hot-reloadable API key
  - Graceful degradation: if Masterchannel unavailable, returns AI-generated profile
  - Supports async job polling (same pattern as KIE)
"""

import requests
import os
import time
import logging
from typing import Optional

logger = logging.getLogger("gen_audius.mastering_adapter")

MASTERCHANNEL_BASE_URL = "https://api.masterchannel.ai"

MASTERCHANNEL_ENDPOINTS = {
    "master":  "/v1/master",
    "status":  "/v1/master/{job_id}/status",
    "download": "/v1/master/{job_id}/download",
}

# Genre-specific mastering presets aligned with streaming standards
GENRE_MASTERING_PRESETS = {
    "bachata": {
        "target_lufs": -14.0,
        "preset": "latin_romantic",
        "eq_profile": {"low": 2.5, "low_mid": -1.0, "high_mid": 1.5, "high": 2.0},
        "comp_ratio": 2.5,
        "stereo_width": 108,
        "limiter_ceiling": -0.3,
        "description": "Warm, romantic. Emphasizes guitar and voice presence.",
    },
    "reggaeton": {
        "target_lufs": -9.0,   # Louder for urban/club
        "preset": "urban_latin",
        "eq_profile": {"low": 5.0, "low_mid": 0.0, "high_mid": 1.0, "high": 1.5},
        "comp_ratio": 6.0,
        "stereo_width": 115,
        "limiter_ceiling": -0.1,
        "description": "Punchy 808 bass, wide stereo, club-ready loudness.",
    },
    "trap": {
        "target_lufs": -10.0,
        "preset": "trap_latino",
        "eq_profile": {"low": 4.0, "low_mid": -2.0, "high_mid": 2.0, "high": 3.0},
        "comp_ratio": 8.0,
        "stereo_width": 120,
        "limiter_ceiling": -0.1,
        "description": "Dark 808, aggressive transients, wide hi-hats.",
    },
    "amapiano": {
        "target_lufs": -12.0,
        "preset": "afrohouse",
        "eq_profile": {"low": 4.0, "low_mid": 1.0, "high_mid": 1.5, "high": 2.5},
        "comp_ratio": 4.0,
        "stereo_width": 125,
        "limiter_ceiling": -0.2,
        "description": "Log drum punch, wide piano, airy reverb tail.",
    },
    "default": {
        "target_lufs": -14.0,
        "preset": "streaming_standard",
        "eq_profile": {"low": 1.0, "low_mid": -0.5, "high_mid": 0.5, "high": 1.0},
        "comp_ratio": 3.0,
        "stereo_width": 105,
        "limiter_ceiling": -0.3,
        "description": "Balanced streaming-ready master. LUFS -14 target.",
    },
}


class MasteringAdapter:
    """
    Generic mastering adapter.

    Supports:
    1. Masterchannel cloud mastering (when API key is configured)
    2. AI profile generation (built-in fallback, always available)

    Both modes return the same interface so the caller never needs to know
    which backend was used.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("MASTERCHANNEL_API_KEY", "")
        self.base_url = MASTERCHANNEL_BASE_URL
        self._session = requests.Session()
        self._update_headers()

    def _update_headers(self):
        self._session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "GenAudius/9.1 (+https://genaudius.com)",
        })

    def update_api_key(self, new_key: str):
        """Hot-reload the API key without restarting."""
        self.api_key = new_key
        self._update_headers()
        logger.info("🔑 [MASTERING] API key hot-reloaded successfully")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 8)

    def _get_preset(self, genre: Optional[str]) -> dict:
        return GENRE_MASTERING_PRESETS.get(genre or "default", GENRE_MASTERING_PRESETS["default"])

    def master_track(
        self,
        audio_url: str,
        genre: Optional[str] = None,
        target_lufs: float = -14.0,
    ) -> dict:
        """
        Master a track via Masterchannel API or AI profile fallback.

        Args:
            audio_url: Public URL of the audio file to master
            genre: Music genre for preset selection
            target_lufs: Target loudness in LUFS

        Returns:
            {
              success: bool,
              mode: 'cloud' | 'ai_profile',
              job_id?: str,           # Only in cloud mode
              mastered_url?: str,     # When cloud mastering completes
              profile: dict,          # Always present - mastering parameters
              genre_preset: str,
              credits_used: int,
            }
        """
        preset = self._get_preset(genre)
        # Override LUFS if caller specifies
        effective_lufs = target_lufs or preset["target_lufs"]

        if self.is_configured:
            return self._master_via_cloud(audio_url, genre, effective_lufs, preset)
        else:
            logger.info(f"ℹ️  [MASTERING] No API key — returning AI profile for genre: {genre}")
            return self._master_via_ai_profile(audio_url, genre, effective_lufs, preset)

    def _master_via_cloud(
        self, audio_url: str, genre: Optional[str], target_lufs: float, preset: dict
    ) -> dict:
        """Submit mastering job to Masterchannel cloud."""
        payload = {
            "audio_url": audio_url,
            "target_lufs": target_lufs,
            "preset": preset["preset"],
            "eq": preset["eq_profile"],
            "comp_ratio": preset["comp_ratio"],
            "stereo_width": preset["stereo_width"],
            "limiter_ceiling": preset["limiter_ceiling"],
            "genre": genre or "latin",
            "format": "wav",
            "sample_rate": 44100,
            "bit_depth": 24,
        }

        logger.info(f"🎚️  [MASTERING] Submitting to Masterchannel | Genre: {genre} | LUFS: {target_lufs}")

        try:
            response = self._session.post(
                f"{self.base_url}{MASTERCHANNEL_ENDPOINTS['master']}",
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            job_id = data.get("job_id") or data.get("id") or data.get("data", {}).get("job_id")
            if not job_id:
                raise ValueError(f"No job_id in Masterchannel response: {data}")

            logger.info(f"✅ [MASTERING] Job submitted | ID: {job_id}")
            return {
                "success": True,
                "mode": "cloud",
                "job_id": job_id,
                "status": "processing",
                "engine": "MASTERCHANNEL",
                "profile": preset,
                "genre_preset": preset["preset"],
                "target_lufs": target_lufs,
                "description": preset["description"],
            }

        except requests.exceptions.HTTPError as e:
            logger.error(f"❌ [MASTERING] Masterchannel HTTP error: {e}")
            # Graceful degradation: return AI profile
            logger.info("↩️  [MASTERING] Falling back to AI profile due to API error")
            result = self._master_via_ai_profile(audio_url, genre, target_lufs, preset)
            result["fallback_reason"] = str(e)
            return result
        except Exception as e:
            logger.error(f"❌ [MASTERING] Unexpected error: {e}")
            return {"success": False, "error": str(e), "mode": "cloud"}

    def _master_via_ai_profile(
        self, audio_url: str, genre: Optional[str], target_lufs: float, preset: dict
    ) -> dict:
        """
        Generate an AI mastering profile without external API.
        Returns parameters ready to apply with Web Audio API on the frontend.
        """
        eq = preset["eq_profile"]
        ratio = preset["comp_ratio"]
        stereo = preset["stereo_width"]

        # Calculate recommended gain makeup
        gain_makeup = max(0.0, min(6.0, -14.0 - target_lufs))

        return {
            "success": True,
            "mode": "ai_profile",
            "status": "complete",
            "engine": "GEN-AUDIUS-AI",
            "audio_url": audio_url,          # Original unchanged
            "mastered_url": None,             # No cloud processing
            "profile": {
                "eq": {
                    "low_hz": 80,
                    "low_gain": eq["low"],
                    "low_mid_hz": 500,
                    "low_mid_gain": eq["low_mid"],
                    "high_mid_hz": 3500,
                    "high_mid_gain": eq["high_mid"],
                    "high_hz": 10000,
                    "high_gain": eq["high"],
                    "q": 0.8,
                },
                "compressor": {
                    "threshold_db": round(-18 + gain_makeup, 1),
                    "ratio": ratio,
                    "attack_ms": 8,
                    "release_ms": 150,
                    "knee_db": 6,
                    "gain_makeup_db": round(gain_makeup, 1),
                },
                "stereo": {
                    "width_percent": stereo,
                    "mono_bass_hz": 200,
                    "mono_compatible": True,
                },
                "limiter": {
                    "ceiling_dbtp": preset["limiter_ceiling"],
                    "threshold_db": -4.0,
                    "release_ms": 100,
                },
                "output": {
                    "target_lufs": target_lufs,
                    "dither": True,
                    "sample_rate": 44100,
                    "bit_depth": 24,
                },
            },
            "genre_preset": preset["preset"],
            "target_lufs": target_lufs,
            "description": preset["description"],
            "ai_remark": self._generate_remark(genre, target_lufs, preset),
        }

    def get_mastering_status(self, job_id: str) -> dict:
        """Poll the status of a cloud mastering job."""
        if not self.is_configured:
            return {"success": False, "error": "Masterchannel not configured"}

        try:
            url = f"{self.base_url}{MASTERCHANNEL_ENDPOINTS['status'].format(job_id=job_id)}"
            response = self._session.get(url, timeout=20)
            response.raise_for_status()
            data = response.json()

            status = data.get("status", "processing")
            if status in ("complete", "done", "finished"):
                mastered_url = data.get("download_url") or data.get("mastered_url")
                return {
                    "success": True,
                    "status": "complete",
                    "mastered_url": mastered_url,
                    "job_id": job_id,
                }
            elif status in ("failed", "error"):
                return {"success": False, "status": "failed", "job_id": job_id}
            else:
                return {"success": True, "status": "processing", "job_id": job_id}

        except Exception as e:
            logger.error(f"❌ [MASTERING STATUS] Error: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def _generate_remark(genre: Optional[str], lufs: float, preset: dict) -> str:
        parts = [
            f"Genre: {genre or 'Generic'} — Using '{preset['preset']}' preset.",
            preset["description"],
            f"Target loudness: {lufs} LUFS (streaming optimized).",
            "Stereo width enhanced for spatial presence.",
        ]
        return " ".join(parts)

    def get_genre_presets(self) -> dict:
        """Return all available genre presets for the frontend configurator."""
        return {
            genre: {
                "name": data["preset"],
                "target_lufs": data["target_lufs"],
                "description": data["description"],
                "stereo_width": data["stereo_width"],
            }
            for genre, data in GENRE_MASTERING_PRESETS.items()
        }


# ─── Singleton instance ────────────────────────────────────────────────────────
mastering_adapter = MasteringAdapter()