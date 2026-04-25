"""
Gen Audius Pro — KIE-SUNO Generic Adapter v2
=============================================
Updated to match KIE.AI current API (2025):
  - Generate: POST /api/v1/generate
  - Status:   GET  /api/v1/generate/record-info?taskId=xxx
  - Lyrics:   POST /api/v1/lyrics/generate

Docs: https://docs.kie.ai/suno-api/generate-music
"""

import requests
import os
import time
import logging
from typing import Optional
from .base_provider import MusicProvider
from dotenv import load_dotenv

load_dotenv()  # Ensure .env is loaded before reading KIE_API_KEY

logger = logging.getLogger("gen_audius.kie_adapter")

KIE_BASE_URL = "https://api.kie.ai"

# KIE API endpoint map — updated to current API (2025)
KIE_ENDPOINTS = {
    "generate": "/api/v1/generate",                    # POST — music generation
    "feed":     "/api/v1/generate/record-info",        # GET  — task status
    "lyrics":   "/api/v1/lyrics/generate",             # POST — lyrics generation
}


class KieSunoAdapter(MusicProvider):
    """
    Generic adapter for KIE.AI → Suno music generation.

    Design principles:
    - Single responsibility: translate Gen Audius domain objects ↔ KIE API payloads
    - Resilient: exponential backoff on transient errors
    - Hot-reloadable: API key can be updated without restart
    - Observable: structured logging on every call
    - Updated: matches KIE.AI API v2025 (customMode, model, vocalGender)
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("KIE_API_KEY", "")
        self.base_url = KIE_BASE_URL
        self._session = requests.Session()
        self._update_headers()

    def _update_headers(self):
        self._session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "GenAudius/9.1 (+https://genaudius.com)",
        })

    def update_api_key(self, new_key: str):
        """Hot-reload the API key without restarting the adapter."""
        self.api_key = new_key
        self._update_headers()
        logger.info("🔑 [KIE] API key hot-reloaded successfully")

    # ── Genre → Style Tag Mapping ──────────────────────────────────────────────
    GENRE_STYLES = {
        "bachata":   "bachata romántica, guitar, flute, romantic, latin",
        "reggaeton": "reggaeton urbano, 808 bass, perreo, urban latin",
        "trap":      "trap latino, dark 808, hi-hats, lo-fi trap",
        "amapiano":  "amapiano, log drum, piano, afrohouse, south african",
        "salsa":     "salsa dura, brass, piano montuno, congas, timbales",
        "merengue":  "merengue, accordion, tambora, güira, dominican",
        "pop":       "latin pop, upbeat, melodic, catchy hooks",
        "balada":    "balada romántica, piano, strings, emotional vocals",
    }

    # ── Model Selection ────────────────────────────────────────────────────────
    # V3.5 is the current industry standard for stability and speed
    DEFAULT_MODEL = "V3.5"

    def _build_payload(
        self,
        prompt: str,
        genre: Optional[str],
        lyrics: Optional[str],
        voice: str,
        style: Optional[str],
        model: str = "V5",
        negative_tags: Optional[str] = None,
        style_weight: Optional[float] = None,
        weirdness: Optional[float] = None,
        audio_weight: Optional[float] = None,
        title: Optional[str] = None,
    ) -> dict:
        style_tag = style or self.GENRE_STYLES.get(genre or "", "latin music, urban")
        is_instrumental = not bool(lyrics and lyrics.strip())
        vocal_gender = "m" if voice == "M" else "f"

        # Build title (max 80 chars per API docs)
        if not title:
            title = f"Gen Audius — {genre or 'Track'} {int(time.time())}"
        
        title = title[:80]

        # callBackUrl is required by KIE API — use a no-op endpoint if not configured
        callback_url = os.getenv("KIE_CALLBACK_URL", "https://webhook.site/gen-audius-noop")

        # Prepare final payload
        final_model = model or self.DEFAULT_MODEL
        # Restore dots if underscores were passed from UI
        if "_" in final_model and "." not in final_model:
            final_model = final_model.replace("_", ".")
            
        payload = {
            "customMode": True,
            "instrumental": is_instrumental,
            "model": final_model,
            "style": style_tag[:1000],
            "title": title,
            "vocalGender": vocal_gender,
            "negativeTags": negative_tags or "noise, distortion, low quality",
            "callBackUrl": callback_url,
        }
        
        # Add lyrics/prompt
        if is_instrumental:
            pass # prompt not needed in instrumental custom mode
        else:
            full_prompt = self._build_prompt(prompt, genre, voice, style)
            payload["prompt"] = (lyrics.strip() if lyrics else full_prompt)[:5000]

        # Add optional weights ONLY if they are provided (prevent null rejection)
        if style_weight is not None:
            payload["styleWeight"] = round(float(style_weight), 2)
        if weirdness is not None:
            payload["weirdnessConstraint"] = round(float(weirdness), 2)
        if audio_weight is not None:
            payload["audioWeight"] = round(float(audio_weight), 2)

        return payload

    def _build_prompt(self, prompt: str, genre: Optional[str], voice: str, style: Optional[str]) -> str:
        """Constructs a clean, effective prompt for the AI model."""
        # Avoid over-cluttering with too many tags which can cause sensitive filter triggers
        parts = [
            prompt.strip() if prompt else "",
            genre.strip() if genre else "",
            style.strip() if style else "",
        ]
        clean_parts = [p for p in parts if p]
        return " | ".join(clean_parts) if clean_parts else "latin music, professional production"

    def _request_with_retry(self, method: str, url: str, max_retries: int = 2, **kwargs) -> requests.Response:
        """Execute request with exponential backoff retry on 5xx errors."""
        last_exc = None
        for attempt in range(max_retries + 1):
            try:
                response = self._session.request(method, url, timeout=30, **kwargs)
                if response.status_code < 500:
                    return response
                # Retry on 5xx
                wait = 2 ** attempt
                logger.warning(f"⚠️  [KIE] {response.status_code} on attempt {attempt+1}/{max_retries+1}. Retrying in {wait}s...")
                time.sleep(wait)
            except requests.exceptions.ConnectionError as e:
                last_exc = e
                wait = 2 ** attempt
                logger.warning(f"⚠️  [KIE] Connection error attempt {attempt+1}. Retrying in {wait}s...")
                time.sleep(wait)
            except requests.exceptions.Timeout as e:
                last_exc = e
                logger.warning(f"⚠️  [KIE] Timeout on attempt {attempt+1}")
                time.sleep(2 ** attempt)

        raise last_exc or requests.exceptions.ConnectionError("Max retries exceeded")

    # ── Public API ─────────────────────────────────────────────────────────────
    def generate_music(
        self,
        prompt: str,
        genre: Optional[str] = None,
        lyrics: Optional[str] = None,
        voice: str = "M",
        style: Optional[str] = None,
        model: str = "V5",
        negative_tags: Optional[str] = None,
        style_weight: Optional[float] = None,
        weirdness: Optional[float] = None,
        audio_weight: Optional[float] = None,
        title: Optional[str] = None,
    ) -> dict:
        """
        Submit a music generation job to KIE.AI.

        Returns:
            {success: bool, task_id: str, status: str, engine: str}
        """
        if not self.api_key:
            logger.error("❌ [KIE] API key not configured")
            return {"success": False, "error": "KIE API key not configured. Set KIE_API_KEY environment variable."}

        payload = self._build_payload(
            prompt, genre, lyrics, voice, style, 
            model=model, negative_tags=negative_tags,
            style_weight=style_weight, weirdness=weirdness,
            audio_weight=audio_weight, title=title
        )
        is_instrumental = payload.get("instrumental", False)
        logger.info(f"🎵 [KIE] Submitting generation | Genre: {genre} | Voice: {voice} | Instrumental: {is_instrumental} | Model: {payload.get('model')}")

        try:
            target_url = f"{self.base_url}{KIE_ENDPOINTS['generate']}"
            response = self._request_with_retry(
                "POST",
                target_url,
                json=payload,
            )

            # Log raw response for debugging — essential for "failed" generations
            logger.info(f"🔍 [KIE] Submit status: {response.status_code}")
            try:
                data = response.json()
                if not isinstance(data, dict):
                    data = {}
            except Exception:
                data = {}
                
            logger.info(f"🔍 [KIE] Raw Payload: {payload}")
            logger.info(f"🔍 [KIE] Raw Response: {data}")

            # Handle non-200 responses safely
            if response.status_code != 200:
                error_msg = data.get("msg") or data.get("message") or f"HTTP {response.status_code}"
                return {"success": False, "error": f"KIE.AI Error: {error_msg}"}

            if not data or data.get("code") not in (200, None, "200"):
                error_code = data.get("code") if data else "Empty"
                error_msg = data.get("msg") or data.get("message") or f"API Error {error_code}"
                logger.error(f"❌ [KIE] API error: {error_msg}")
                return {"success": False, "error": error_msg}

            # Map various possible task ID field names
            task_id = (
                data.get("data", {}).get("taskId")
                or data.get("taskId")
                or data.get("task_id")
                or data.get("data", {}).get("task_id")
            )

            if not task_id:
                logger.error(f"❌ [KIE] No task_id in response structure: {data}")
                return {"success": False, "error": "No se recibió un Task ID válido de KIE.AI"}

            logger.info(f"✅ [KIE] Generation queued | Task: {task_id}")
            return {
                "success": True,
                "task_id": task_id,
                "status": "processing",
                "engine": "KIE-SUNO",
            }

        except requests.exceptions.HTTPError as e:
            logger.error(f"❌ [KIE] HTTP error: {e}")
            return {"success": False, "error": f"Error de conexión: {str(e)}"}
        except Exception as e:
            logger.error(f"❌ [KIE] Unexpected error: {e}")
            return {"success": False, "error": f"Error interno: {str(e)}"}

    def get_status(self, task_id: str) -> dict:
        """
        Poll generation status for a given task_id.

        KIE API v2025: GET /api/v1/generate/record-info?taskId=xxx

        Status values:
          PENDING, TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS,
          CREATE_TASK_FAILED, GENERATE_AUDIO_FAILED, CALLBACK_EXCEPTION, SENSITIVE_WORD_ERROR

        Returns normalized status dict:
            {success, status: 'processing'|'complete'|'failed', audio_url?, ...}
        """
        if not self.api_key:
            return {"success": False, "status": "failed", "error": "KIE API key not configured"}

        try:
            response = self._request_with_retry(
                "GET",
                f"{self.base_url}{KIE_ENDPOINTS['feed']}",
                params={"taskId": task_id},
            )
            response.raise_for_status()
            try:
                data = response.json()
                if not isinstance(data, dict):
                    data = {}
            except Exception:
                data = {}

            inner = data.get("data")
            if not isinstance(inner, dict):
                inner = {}

            status_raw = inner.get("status") or data.get("status") or ""
            suno_res = inner.get("response")
            if not isinstance(suno_res, dict):
                suno_res = {}
            suno_data = suno_res.get("sunoData", [])

            # SUCCESS or FIRST_SUCCESS with audio data → complete
            if status_raw in ("SUCCESS", "FIRST_SUCCESS") or (suno_data and len(suno_data) > 0):
                if suno_data:
                    track = suno_data[0]
                    return {
                        "success": True,
                        "status": "complete",
                        "audio_url":  track.get("audioUrl") or track.get("audio_url"),
                        "stream_url": track.get("streamAudioUrl"),
                        "image_url":  track.get("imageUrl") or track.get("image_url"),
                        "lyrics":     track.get("prompt") or track.get("lyrics"),
                        "title":      track.get("title"),
                        "duration":   track.get("duration"),
                        "task_id":    task_id,
                        "all_tracks": [
                            {
                                "audio_url":  t.get("audioUrl"),
                                "stream_url": t.get("streamAudioUrl"),
                                "image_url":  t.get("imageUrl"),
                                "title":      t.get("title"),
                                "duration":   t.get("duration"),
                            }
                            for t in suno_data
                        ],
                    }
                return {"success": True, "status": "complete", "task_id": task_id}

            # Failed statuses
            elif status_raw in ("CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "CALLBACK_EXCEPTION", "SENSITIVE_WORD_ERROR", "FAILED", "failed", "error"):
                error_msg = inner.get("errorMessage") or f"Generation failed: {status_raw}"
                return {"success": False, "status": "failed", "task_id": task_id, "error": error_msg}

            else:
                # Still processing (PENDING, TEXT_SUCCESS, RUNNING, QUEUE, etc.)
                return {"success": True, "status": "processing", "task_id": task_id, "kie_status": status_raw}

        except Exception as e:
            logger.error(f"❌ [KIE FEED] Critical error fetching task {task_id}: {e}")
            return {
                "success": False, 
                "status": "failed", 
                "error": str(e),
                "task_id": task_id
            }

    def generate_lyrics(self, theme: str, genre: Optional[str] = None, lang: str = "es") -> dict:
        """
        Generate lyrics for a given theme and genre.
        KIE API v2025: POST /api/v1/lyrics/generate
        """
        if not self.api_key:
            return {"success": False, "error": "KIE API key not configured"}

        if lang == "es":
            prompt = f"Escribe una letra de {genre or 'canción latina'} en español sobre: {theme}. Incluye: verso 1, coro, verso 2, bridge. Máximo 300 palabras."
        else:
            prompt = f"Write {genre or 'latin'} song lyrics in English about: {theme}. Include: verse 1, chorus, verse 2, bridge. Max 300 words."

        try:
            response = self._request_with_retry(
                "POST",
                f"{self.base_url}{KIE_ENDPOINTS['lyrics']}",
                json={"prompt": prompt},
            )
            response.raise_for_status()
            data = response.json()

            # Handle both old and new response structures
            lyrics = (
                data.get("data", {}).get("lyrics")
                or data.get("data", {}).get("text")
                or data.get("lyrics")
                or data.get("text", "")
            )
            task_id = data.get("data", {}).get("taskId") or data.get("taskId")

            if task_id and not lyrics:
                # Async lyrics generation — return task_id for polling
                return {"success": True, "task_id": task_id, "status": "processing"}

            return {"success": True, "lyrics": lyrics}
        except Exception as e:
            logger.error(f"❌ [KIE LYRICS] Error: {e}")
            return {"success": False, "error": str(e)}


# ─── Singleton instance ────────────────────────────────────────────────────────
kie_adapter = KieSunoAdapter()