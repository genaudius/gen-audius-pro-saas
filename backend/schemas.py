"""
Gen Audius Pro — Pydantic Request Schemas
==========================================
All API request models centralized.
"""
from typing import Optional
from pydantic import BaseModel, Field, validator


class MusicGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    genre: str | None = Field(None, max_length=100)
    lyrics: str | None = Field(None, max_length=5000)
    voice: str = Field("M", pattern="^[MF]$")
    style: str | None = Field(None, max_length=200)
    model: str | None = Field("V5", max_length=20)
    negative_tags: str | None = Field(None, max_length=500)
    style_weight: float | None = Field(None, ge=0, le=1)
    weirdness: float | None = Field(None, ge=0, le=1)
    audio_weight: float | None = Field(None, ge=0, le=1)
    provider: str | None = Field("modal", max_length=50)
    api_key: str | None = Field(None, max_length=500)
    title: str | None = Field(None, max_length=150)

    @validator("prompt")
    def sanitize_prompt(cls, v):
        return v.strip()


class RechargeRequest(BaseModel):
    amount: float = Field(..., gt=0, le=10000, description="USD amount to add")


class ConfigUpdateRequest(BaseModel):
    provider: str = Field(..., min_length=1, max_length=50)
    apiKey: str | None = None
    baseUrl: str | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class MasterRequest(BaseModel):
    audio_url: str = Field(..., min_length=10, max_length=2000)
    genre: str | None = Field(None, max_length=100)
    target_lufs: float = Field(-14.0, ge=-24.0, le=-6.0)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=1, max_length=200)


class DevExecuteRequest(BaseModel):
    prompt: str
    commit: bool = True


class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    assigned_to: str = "admin"


class BlogCreateRequest(BaseModel):
    title: str
    content: str
    category: str = "news"
    image_url: Optional[str] = None


class EmailSettingsRequest(BaseModel):
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str
    from_email: str


class SocialLoginRequest(BaseModel):
    email: str
    uid: str
    username: Optional[str] = None
    provider: Optional[str] = "google"


class CloudResourceRequest(BaseModel):
    name: str
    provider: str
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    status: Optional[str] = "active"
    config_json: Optional[str] = None


class TrainingStartRequest(BaseModel):
    type: str  # voice | instrument | style
    name: str
    provider: str  # runpod | modal
    data_url: Optional[str] = None


class StripeSessionRequest(BaseModel):
    plan_id: str  # basic | pro | studio
    success_url: str
    cancel_url: str


class LegalUpdateRequest(BaseModel):
    slug: str
    title: str
    content: str
    version: Optional[str] = "1.0.0"
    is_active: Optional[bool] = True


class PayoutRequest(BaseModel):
    amount: float
    currency: str = "usd"


class HumToMusicRequest(BaseModel):
    audio_url: str
    prompt: Optional[str] = None
    genre: Optional[str] = "Bachata"
    bpm: Optional[int] = None
    key: Optional[str] = None


class InstrumentEditRequest(BaseModel):
    stem_url: str
    instruction_prompt: str
    target_instrument: Optional[str] = None


class ImageGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    aspect_ratio: str = Field("1:1", pattern="^(1:1|16:9|9:16|4:3|3:4|21:9)$")
    style: str | None = Field(None, max_length=100)
    negative_prompt: str | None = Field(None, max_length=500)
    provider: str | None = Field("genaudius_v1", max_length=50)
    num_images: int = Field(1, ge=1, le=4)

    @validator("prompt")
    def sanitize(cls, v):
        return v.strip()


class VideoGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    duration: int = Field(5, ge=3, le=60)
    aspect_ratio: str = Field("16:9", pattern="^(16:9|9:16|1:1|4:3)$")
    motion_style: str | None = Field(None, max_length=100)
    provider: str | None = Field("genaudius_v1", max_length=50)

    @validator("prompt")
    def sanitize(cls, v):
        return v.strip()


class VoiceGenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    gender: str = Field("female", pattern="^(male|female)$")
    speed: str = Field("normal", pattern="^(slow|normal|fast)$")
    tone: str | None = Field(None, max_length=100)
    provider: str | None = Field("elevenlabs", max_length=50)
    voice_id: str | None = Field(None, max_length=100)
