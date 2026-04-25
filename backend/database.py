"""
Gen Audius Pro — Database Layer
================================
Dual persistence architecture:
  • PostgreSQL  → Wallets, API Configs, User Accounts (financial ledger)
  • MongoDB     → Music generations, logs, history (audio vault) [OPTIONAL]

MongoDB is OPTIONAL — if not available, falls back to SQLite-only mode.
Security: NO secrets hardcoded. All sensitive values come from env vars.
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from datetime import datetime
import os
import logging
from dotenv import load_dotenv

# Load .env before reading any env vars
load_dotenv()

logger = logging.getLogger("gen_audius.db")

# ─── PostgreSQL / SQLite: Financial Ledger ────────────────────────────────────
POSTGRES_URL = os.getenv("DATABASE_URL", "sqlite:///./gen_audius_dev.db")

# SQLite doesn't support pool_size/max_overflow — detect dialect
_is_sqlite = POSTGRES_URL.startswith("sqlite")

if _is_sqlite:
    engine = create_engine(
        POSTGRES_URL,
        connect_args={"check_same_thread": False, "timeout": 15},
        echo=False,
    )
else:
    engine = create_engine(
        POSTGRES_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserWallet(Base):
    __tablename__ = "wallets"
    user_id   = Column(String, primary_key=True, index=True)
    credits   = Column(Integer, default=1000, nullable=False)
    balance   = Column(Float, default=100.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class APIConfig(Base):
    __tablename__ = "api_configs"
    provider      = Column(String, primary_key=True)
    api_key       = Column(String, nullable=False)
    base_url      = Column(String, nullable=False)
    status        = Column(String, default="inactive")
    cost_per_gen  = Column(Integer, default=5)
    cost_per_sec  = Column(Integer, default=0)
    last_updated  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # ── Failover fields ────────────────────────────────────────────────────────
    priority      = Column(Integer, default=99)   # 1 = highest (tried first)
    health_score  = Column(Integer, default=100)  # 0–100; decreases on failures
    display_name  = Column(String, default="")    # Human-readable label for UI

class CreditTransaction(Base):
    """Registro de transacciones de créditos para auditoría."""
    __tablename__ = "credit_transactions"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(String, nullable=False, index=True)
    amount      = Column(Integer, nullable=False)  # positivo para recarga, negativo para consumo
    type_       = Column(String, nullable=False)  # 'recharge', 'consumption', 'refund', 'admin_adjustment'
    reference   = Column(String, nullable=True)   # ID de la generación o transacción
    description = Column(Text, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)


class UserAccount(Base):
    """Enhanced user account with roles and security."""
    __tablename__ = "user_accounts"
    user_id       = Column(String, primary_key=True, index=True)
    username      = Column(String, unique=True, nullable=False)
    email         = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active     = Column(Boolean, default=True)
    is_verified   = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_token   = Column(String, nullable=True)
    role          = Column(String, default="user") # user | artist | admin | moderator
    artist_type   = Column(String, nullable=True)  # dj | locutor | musico | productor | artista_indie
    last_login    = Column(DateTime, nullable=True)
    failed_attempts = Column(Integer, default=0)
    created_at    = Column(DateTime, default=datetime.utcnow)
    plan          = Column(String, default="free") 
    
    # Social Integrations
    spotify_id    = Column(String, nullable=True)
    lastfm_user   = Column(String, nullable=True)
    # Stripe Integration
    stripe_customer_id = Column(String, nullable=True, index=True)
    stripe_connect_id  = Column(String, nullable=True, index=True) # For Payouts
    subscription_id    = Column(String, nullable=True)
    subscription_status = Column(String, default="inactive") # active | trialing | past_due | canceled


class GenerationLog(Base):
    """Structured log of every generation attempt for billing audit."""
    __tablename__ = "generation_logs"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(String, nullable=False, index=True)
    task_id     = Column(String, nullable=True, index=True)
    engine      = Column(String, nullable=False)
    credits_used = Column(Integer, default=0)
    status      = Column(String, default="pending")
    created_at  = Column(DateTime, default=datetime.utcnow)
    error_msg   = Column(Text, nullable=True)
    result_json = Column(Text, nullable=True) # JSON field for MIDI/Stems data


class PublishedTrack(Base):
    """Tracks published by artists to the public Explore feed."""
    __tablename__ = "published_tracks"
    id              = Column(Integer, primary_key=True, autoincrement=True)
    track_id        = Column(String, unique=True, index=True, nullable=False)
    user_id         = Column(String, nullable=False, index=True)
    username        = Column(String, nullable=False)
    title           = Column(String, nullable=False)
    genre           = Column(String, nullable=True)
    audio_url       = Column(Text, nullable=True)
    image_url       = Column(Text, nullable=True)
    description     = Column(Text, nullable=True)
    tags            = Column(Text, nullable=True)
    likes           = Column(Integer, default=0)
    plays           = Column(Integer, default=0)
    shares          = Column(Integer, default=0)
    trending_score  = Column(Float, default=0.0)
    is_public       = Column(Boolean, default=True)
    is_featured     = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TrackLike(Base):
    """Records which users liked which tracks (prevents duplicates)."""
    __tablename__ = "track_likes"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    track_id   = Column(String, nullable=False, index=True)
    user_id    = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ArtistProfile(Base):
    """Public artist profile for the Explore/Social features."""
    __tablename__ = "artist_profiles"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    user_id      = Column(String, unique=True, index=True, nullable=False)
    username     = Column(String, nullable=False)
    bio          = Column(Text, nullable=True)
    avatar_url   = Column(Text, nullable=True)
    banner_url   = Column(Text, nullable=True)
    genre_tags   = Column(Text, nullable=True)
    total_plays  = Column(Integer, default=0)
    total_likes  = Column(Integer, default=0)
    followers    = Column(Integer, default=0)
    verified     = Column(Boolean, default=False)
    created_at   = Column(DateTime, default=datetime.utcnow)


class SystemTask(Base):
    """Internal server tasks for background processing or admin reminders."""
    __tablename__ = "system_tasks"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    title       = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(String, default="admin")  # admin | system | ai_agent
    status      = Column(String, default="pending") # pending | running | completed | failed
    priority    = Column(String, default="medium")  # low | medium | high | critical
    due_date    = Column(DateTime, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BlogPost(Base):
    """Management of news and promotion articles."""
    __tablename__ = "blog_posts"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    slug        = Column(String, unique=True, index=True)
    title       = Column(String, nullable=False)
    content     = Column(Text, nullable=False)
    image_url   = Column(String, nullable=True)
    author_id   = Column(String, nullable=False)
    is_published = Column(Boolean, default=True)
    category    = Column(String, default="news") # news | tutorial | update


class UserAPIKey(Base):
    """SaaS API Keys for third-party developers/users."""
    __tablename__ = "user_api_keys"
    id            = Column(Integer, primary_key=True, autoincrement=True)
    key           = Column(String, unique=True, index=True, nullable=False)
    user_id       = Column(String, nullable=False, index=True)
    name          = Column(String, nullable=False) # e.g. "My Music App"
    status        = Column(String, default="active") # active | revoked
    total_calls   = Column(Integer, default=0)
    last_used_at  = Column(DateTime, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)


class LegalDocument(Base):
    """Legal documents (Terms of Service, Privacy Policy, Cookie Policy)."""
    __tablename__ = "legal_documents"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    slug        = Column(String, unique=True, index=True) # terms, privacy, cookies
    title       = Column(String, nullable=False)
    content     = Column(Text, nullable=False) # Markdown/HTML content
    version     = Column(String, default="1.0.0")
    is_active   = Column(Boolean, default=True)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SecurityLog(Base):
    """Anti-fraud and security monitoring."""
    __tablename__ = "security_logs"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(String, index=True, nullable=True)
    event_type  = Column(String, nullable=False) # login_fail | suspicious_activity | fraud_attempt
    ip_address  = Column(String, nullable=True)
    user_agent  = Column(String, nullable=True)
    severity    = Column(String, default="low") # low | medium | high | critical
    details     = Column(Text, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)


class EmailConfig(Base):
    """SMTP and Email Service settings."""
    __tablename__ = "email_configs"
    id          = Column(Integer, primary_key=True)
    smtp_host   = Column(String, default="smtp.gmail.com")
    smtp_port   = Column(Integer, default=587)
    smtp_user   = Column(String, nullable=True)
    smtp_pass   = Column(String, nullable=True)
    from_email  = Column(String, default="noreply@genaudius.com")
    use_tls     = Column(Boolean, default=True)
    is_active   = Column(Boolean, default=False)


class CloudResource(Base):
    """Cloud credentials and serverless endpoints (Modal, RunPod, GCP)."""
    __tablename__ = "cloud_resources"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    name        = Column(String, unique=True, index=True) # e.g. 'runpod-gpu', 'modal-audio'
    provider    = Column(String, nullable=False)        # runpod | modal | gcp | custom
    api_key     = Column(String, nullable=True)
    endpoint    = Column(String, nullable=True)
    status      = Column(String, default="active")
    config_json = Column(Text, nullable=True)           # For provider-specific settings
    created_at  = Column(DateTime, default=datetime.utcnow)

class SystemSetting(Base):
    """Configuraciones globales del sistema (modo mantenimiento, etc)."""
    __tablename__ = "system_settings"
    key         = Column(String, primary_key=True)
    value       = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TrainingJob(Base):
    """Tracks AI model training (instruments, voices, etc)."""
    __tablename__ = "training_jobs"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    job_id      = Column(String, unique=True, index=True) # Remote ID from provider
    user_id     = Column(String, index=True)
    type        = Column(String, nullable=False)          # voice | instrument | style
    name        = Column(String, nullable=False)          # Name of the resulting model
    provider    = Column(String, nullable=False)          # runpod | modal etc.
    status      = Column(String, default="pending")       # pending | training | completed | failed
    data_url    = Column(String, nullable=True)           # Path to training dataset
    model_url   = Column(String, nullable=True)           # Path to final weights
    logs        = Column(Text, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


# ─── Stripe & Financial Orchestration ─────────────────────────────────────────

class StripeSubscription(Base):
    """Tracks historical and active subscriptions."""
    __tablename__ = "stripe_subscriptions"
    id              = Column(Integer, primary_key=True, autoincrement=True)
    user_id         = Column(String, index=True, nullable=False)
    stripe_sub_id   = Column(String, unique=True, index=True)
    plan_id         = Column(String, nullable=False) # basic | pro | studio
    status          = Column(String, nullable=False) # active | canceled | past_due
    current_period_end = Column(DateTime, nullable=False)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)


class StripePayout(Base):
    """Tracks 'Cash-Out' operations — money leaving the platform to users."""
    __tablename__ = "stripe_payouts"
    id              = Column(Integer, primary_key=True, autoincrement=True)
    user_id         = Column(String, index=True, nullable=False)
    stripe_transfer_id = Column(String, unique=True, index=True)
    amount          = Column(Float, nullable=False) # Total sent to user
    currency        = Column(String, default="usd")
    status          = Column(String, default="pending") # pending | paid | failed
    created_at      = Column(DateTime, default=datetime.utcnow)


class UserEarnings(Base):
    """Accumulated earnings for monetization (Cash-Out balance)."""
    __tablename__ = "user_earnings"
    user_id         = Column(String, primary_key=True, index=True)
    total_earned    = Column(Float, default=0.0) # Cumulative historique
    current_balance = Column(Float, default=0.0) # Withdraw-ready funds (after 20% platform cut)
    pending_payouts = Column(Float, default=0.0)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



# ─── MongoDB: Audio Vault (OPTIONAL) ─────────────────────────────────────────
# MongoDB is optional. If not available, a NullCollection stub is used so
# the rest of the app works without any changes.

class _NullCollection:
    """Stub that silently no-ops all MongoDB operations when Mongo is unavailable."""
    def insert_one(self, doc):
        logger.debug("[MongoDB-STUB] insert_one skipped (MongoDB not available)")
        return None
    def find(self, *args, **kwargs):
        return []
    def find_one(self, *args, **kwargs):
        return None
    def update_one(self, *args, **kwargs):
        return None
    def create_index(self, *args, **kwargs):
        return None
    def count_documents(self, *args, **kwargs):
        return 0


MONGO_AVAILABLE = False
hits_collection = _NullCollection()
logs_collection = _NullCollection()

MONGO_URL = os.getenv("MONGO_URL", "").strip()

if MONGO_URL:
    try:
        from pymongo import MongoClient, DESCENDING
        mongo_client = MongoClient(
            MONGO_URL,
            serverSelectionTimeoutMS=2000,   # Fast fail — 2s max
            connectTimeoutMS=2000,
            socketTimeoutMS=3000,
            maxPoolSize=10,
        )
        # Force connection test with short timeout
        mongo_client.admin.command("ping")
        mongo_db        = mongo_client["gen_audius_hits"]
        hits_collection = mongo_db["tracks"]
        logs_collection = mongo_db["system_logs"]
        failover_logs   = mongo_db["failover_logs"]  # Failover event trazability
        MONGO_AVAILABLE = True

        # Ensure indexes for performance
        try:
            hits_collection.create_index([("userId", 1), ("timestamp", DESCENDING)])
            hits_collection.create_index([("taskId", 1)], unique=True, sparse=True)
            logs_collection.create_index([("level", 1), ("timestamp", DESCENDING)])
            failover_logs.create_index([("timestamp", DESCENDING)])
        except Exception:
            pass

        logger.info("✅ [DB] MongoDB connected and indexes verified.")

    except Exception as e:
        logger.warning(f"⚠️  [DB] MongoDB not available ({e}). Running in SQLite-only mode. "
                       "Set MONGO_URL env var to enable MongoDB.")
        MONGO_AVAILABLE = False
        failover_logs = _NullCollection()
else:
    logger.info("ℹ️  [DB] MongoDB disabled by config (MONGO_URL is empty).")
    MONGO_AVAILABLE = False
    failover_logs = _NullCollection()


# ─── Schema Migration (idempotent) ───────────────────────────────────────────
def _migrate_columns() -> None:
    """
    Adds new columns to existing tables with ALTER TABLE IF NOT EXISTS.
    Runs before any ORM query to prevent 'column does not exist' errors.
    Safe to call repeatedly — no-ops if columns already exist.
    """
    # SQLite uses different syntax (no IF NOT EXISTS support in old versions)
    if _is_sqlite:
        sqlite_cols = [
            ("api_configs", "priority",     "INTEGER DEFAULT 99"),
            ("api_configs", "health_score", "INTEGER DEFAULT 100"),
            ("api_configs", "display_name", "VARCHAR DEFAULT ''"),
            ("generation_logs", "result_json", "TEXT"),
        ]
        with engine.connect() as conn:
            for table_name, col_name, col_def in sqlite_cols:
                # Get existing columns for this table
                result = conn.execute(text(f"PRAGMA table_info({table_name})"))
                existing_cols = {row[1] for row in result}
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def}"))
                        conn.commit()
                    except Exception as e:
                        logger.error(f"Failed to migrate {table_name}.{col_name}: {e}")
    else:
        # PostgreSQL supports IF NOT EXISTS
        new_cols_pg = [
            "ALTER TABLE api_configs ADD COLUMN IF NOT EXISTS priority     INTEGER DEFAULT 99",
            "ALTER TABLE api_configs ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100",
            "ALTER TABLE api_configs ADD COLUMN IF NOT EXISTS display_name VARCHAR DEFAULT ''",
            "ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS result_json TEXT",
        ]
        with engine.connect() as conn:
            for sql in new_cols_pg:
                try:
                    conn.execute(text(sql))
                    conn.commit()
                except Exception:
                    conn.rollback()


# ─── Initialisation ───────────────────────────────────────────────────────────
def init_dbs():
    """
    Create all tables and seed default configurations.
    API keys are loaded from environment variables only — never hardcoded.
    """
    Base.metadata.create_all(bind=engine)

    # Ensure new failover columns exist on pre-existing tables (idempotent)
    _migrate_columns()

    db = SessionLocal()
    try:
        # Verify SQLite/Postgres connectivity
        db.execute(text("SELECT 1"))
        logger.info("✅ [DB] SQLite/PostgreSQL connection verified.")

        # Seed KIE-SUNO config if absent (key comes from env)
        if not db.query(APIConfig).filter(APIConfig.provider == "KIE-SUNO").first():
            kie_key = os.getenv("KIE_API_KEY", "")
            if not kie_key:
                logger.warning("⚠️  [DB] KIE_API_KEY not set in environment. Set it via Admin Panel or .env file.")
            kie = APIConfig(
                provider="KIE-SUNO",
                api_key=kie_key,
                base_url="https://api.kie.ai",
                status="active" if kie_key else "inactive",
                cost_per_gen=5,
            )
            db.add(kie)
        else:
            # Update existing record if env var has a value and DB is empty
            existing = db.query(APIConfig).filter(APIConfig.provider == "KIE-SUNO").first()
            env_key = os.getenv("KIE_API_KEY", "")
            if env_key and not existing.api_key:
                existing.api_key = env_key
                existing.status = "active"
                logger.info("🔑 [DB] KIE_API_KEY loaded from env into DB.")

        # Seed Masterchannel config if absent
        if not db.query(APIConfig).filter(APIConfig.provider == "MASTERCHANNEL").first():
            mc_key = os.getenv("MASTERCHANNEL_API_KEY", "")
            mc = APIConfig(
                provider="MASTERCHANNEL",
                api_key=mc_key,
                base_url="https://api.masterchannel.ai",
                status="active" if mc_key else "inactive",
                cost_per_gen=3,
            )
            db.add(mc)

        # Seed MusicGPT config
        if not db.query(APIConfig).filter(APIConfig.provider == "MUSICGPT").first():
            db.add(APIConfig(
                provider="MUSICGPT",
                api_key=os.getenv("MUSICGPT_API_KEY", ""),
                base_url="https://api.musicgpt.ai",
                status="inactive",
                cost_per_gen=4,
            ))

        # Seed ElevenLabs config
        if not db.query(APIConfig).filter(APIConfig.provider == "ELEVENLABS").first():
            db.add(APIConfig(
                provider="ELEVENLABS",
                api_key=os.getenv("ELEVENLABS_API_KEY", ""),
                base_url="https://api.elevenlabs.io",
                status="inactive",
                cost_per_gen=2,
            ))

        # Seed Gemini Music config
        if not db.query(APIConfig).filter(APIConfig.provider == "GEMINI_MUSIC").first():
            db.add(APIConfig(
                provider="GEMINI_MUSIC",
                api_key=os.getenv("GEMINI_API_KEY", ""),
                base_url="https://generativelanguage.googleapis.com",
                status="inactive",
                cost_per_gen=3,
            ))

        # Seed MODAL Generation Engine 
        if not db.query(APIConfig).filter(APIConfig.provider == "MODAL").first():
            db.add(APIConfig(
                provider="MODAL",
                api_key=os.getenv("MODAL_API_KEY", ""),
                base_url=os.getenv("MODAL_API_URL", ""),
                status="active" if os.getenv("MODAL_API_KEY") else "inactive",
                priority=1,
                cost_per_gen=10,
                display_name="Gen Audius (Modal GPU)"
            ))

        # Seed initial Cloud Resource placeholders
        if not db.query(CloudResource).filter(CloudResource.provider == "runpod").first():
            db.add(CloudResource(
                name="RunPod Serverless",
                provider="runpod",
                status="inactive",
                endpoint="https://api.runpod.ai/v2/"
            ))
        if not db.query(CloudResource).filter(CloudResource.provider == "modal").first():
            db.add(CloudResource(
                name="Modal Engines",
                provider="modal",
                status="inactive"
            ))

        # Seed demo wallet (replace with real user auth in production)
        if not db.query(UserWallet).filter(UserWallet.user_id == "current_user").first():
            wallet = UserWallet(user_id="current_user", credits=100, balance=10.0)
            db.add(wallet)

        # Seed maintenance mode
        if not db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first():
            db.add(SystemSetting(
                key="maintenance_mode",
                value="off",
                description="Blocked non-admin access if 'on'"
            ))

        # Seed legal documents
        if not db.query(LegalDocument).filter(LegalDocument.slug == "terms").first():
            db.add(LegalDocument(
                slug="terms",
                title="Términos de Servicio",
                content="""# Términos de Servicio: Gen Audius Pro
Fecha de entrada en vigor: 12 de Marzo de 2026

1. El Servicio
GEN AUDIUS LLC ("la Compañía", "nosotros") opera Gen Audius Pro, una plataforma de IA para la creación musical...""",
                version="1.0.0"
            ))
        if not db.query(LegalDocument).filter(LegalDocument.slug == "privacy").first():
            db.add(LegalDocument(
                slug="privacy",
                title="Política de Privacidad",
                content="# Política de Privacidad\nTu privacidad es importante para nosotros...",
                version="1.0.0"
            ))
        if not db.query(LegalDocument).filter(LegalDocument.slug == "cookies").first():
            db.add(LegalDocument(
                slug="cookies",
                title="Política de Cookies",
                content="# Política de Cookies\nUtilizamos cookies para mejorar tu experiencia...",
                version="1.0.0"
            ))

        db.commit()
        mongo_status = "✅ MongoDB" if MONGO_AVAILABLE else "⚠️  MongoDB OFFLINE (SQLite-only mode)"
        logger.info(f"✅ [DB] Initialized. {mongo_status}")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ [DB] Initialization error: {e}")
        raise
    finally:
        db.close()


init_dbs()