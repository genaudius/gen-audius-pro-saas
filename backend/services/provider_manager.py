"""
Gen Audius Pro — Provider Manager
==================================
Carga los archivos YAML de configs/providers/ y gestiona la cadena de failover
entre los diferentes proveedores de música (KIE-SUNO → Mureka → Suno Direct).

Compatible con el proyecto real: usa la instancia singleton de database.py,
incluyendo el NullCollection stub para MongoDB.
"""
from __future__ import annotations

import os
import glob
import logging
import yaml
from datetime import datetime
from typing import Optional, List, Dict
from .music.kie_suno_adapter import KieSunoAdapter
from .music.mureka_adapter import MurekaAdapter
from .music.modal_adapter import ModalMusicAdapter
from .music.hf_adapter import HuggingFaceAdapter
from .music.sao_modal_adapter import SaoModalAdapter
from .music.base_provider import MusicProvider

logger = logging.getLogger("gen_audius.provider_manager")

# Ruta base de los YAMLs (relativa al directorio del backend)
_HERE = os.path.dirname(os.path.abspath(__file__))
PROVIDERS_DIR = os.path.join(_HERE, "..", "configs", "providers")


class ProviderConfig:
    """Configuración de un proveedor, mezclando YAML + registro de DB."""

    def __init__(self, yaml_data: dict, db_config=None):
        self.name         = yaml_data["name"]
        self.display_name = yaml_data.get("display_name", self.name)
        self.priority     = yaml_data.get("priority", 99)
        self.enabled      = yaml_data.get("enabled", True)
        self.cost_per_gen = yaml_data.get("cost_per_gen", 5)
        self.timeout      = yaml_data.get("timeout", 30)
        # "kind" determina en qué cadenas participa el provider:
        #   - "music"  → cadena de generación de audio (default)
        #   - "lyrics" → cadena de letras (HF llama)
        #   - "both"   → ambas
        # Esto evita que providers solo-letras como HuggingFace contaminen
        # la cadena de música y gatillen "Todos los proveedores fallaron".
        self.kind         = yaml_data.get("kind", "music")
        conn              = yaml_data.get("connection", {})
        self.base_url     = conn.get("base_url", "")
        self.endpoints    = yaml_data.get("endpoints", {})
        self.health_cfg   = yaml_data.get("health", {})

        # Overlay con datos vivos de la DB (api_key, status, health_score)
        if db_config:
            self.api_key      = db_config.api_key or ""
            self.health_score = getattr(db_config, "health_score", 100) or 100
            if db_config.status == "inactive":
                self.enabled = False
        else:
            env_key           = yaml_data.get("connection", {}).get("api_key_env", "")
            self.api_key      = os.getenv(env_key, "") if env_key else ""
            self.health_score = 100

    @property
    def is_available(self) -> bool:
        # Some providers are local/CLI-driven and don't require an API key.
        # GAU runs via Modal CLI from this machine, so key presence should not gate availability.
        if self.name.upper() in ("GAU", "GAD", "SAO", "SAO-MODAL", "STABLE-AUDIO"):
            return self.enabled and self.health_score > 0
        return self.enabled and self.health_score > 0 and bool(self.api_key)

    def to_dict(self) -> dict:
        return {
            "name":         self.name,
            "display_name": self.display_name,
            "priority":     self.priority,
            "enabled":      self.enabled,
            "available":    self.is_available,
            "health_score": self.health_score,
            "cost_per_gen": self.cost_per_gen,
            "base_url":     self.base_url,
            "has_api_key":  bool(self.api_key),
        }


class ProviderManager:
    """
    Gestor central de proveedores de música.

    Flujo de uso típico:
        result = provider_manager.execute_with_failover(generate_fn, payload)
    """

    def __init__(self):
        self._providers: List[ProviderConfig] = []
        self._adapters: Dict[str, MusicProvider] = {}
        self.load_providers()
        self._init_adapters()

    def _init_adapters(self) -> None:
        """Inicializa las instancias de los adapters con las API keys cargadas."""
        for p in self._providers:
            name = p.name.upper()
            if name in ("KIE", "KIE-SUNO"):
                self._adapters[p.name] = KieSunoAdapter(api_key=p.api_key)
            elif name == "MUREKA":
                self._adapters[p.name] = MurekaAdapter(api_key=p.api_key)
            elif name == "MODAL":
                # La env MODAL_API_URL tiene precedencia sobre el YAML para que
                # un cambio de endpoint en producción no requiera redeploy del YAML.
                modal_url = os.getenv("MODAL_API_URL", "") or p.base_url
                if modal_url and modal_url != p.base_url:
                    logger.info(
                        f"[ProviderManager] MODAL base_url overridden by env: "
                        f"{p.base_url} -> {modal_url}"
                    )
                self._adapters[p.name] = ModalMusicAdapter(api_key=p.api_key, base_url=modal_url)
            elif name in ("GAU", "GAD", "SAO", "SAO-MODAL", "STABLE-AUDIO"):
                self._adapters[p.name] = SaoModalAdapter()
            elif name == "HUGGINGFACE":
                self._adapters[p.name] = HuggingFaceAdapter()
            # Otros proveedores se añadirán aquí de forma genérica

    def get_adapter(self, name: str) -> Optional[MusicProvider]:
        """Retorna la instancia del adapter para un proveedor dado."""
        # Si el nombre viene en minúsculas o con guiones, intentamos normalizar
        adapter = self._adapters.get(name)
        if not adapter:
            # Búsqueda insensible a mayúsculas
            for k, v in self._adapters.items():
                if k.upper() == name.upper():
                    return v
        return adapter

    # ──────────────────────────────────────────
    # Carga de proveedores desde YAML + DB
    # ──────────────────────────────────────────

    def load_providers(self) -> None:
        """Escanea configs/providers/*.yaml y cruza con la DB."""
        from database import SessionLocal, APIConfig  # importación diferida

        yaml_files = sorted(glob.glob(os.path.join(PROVIDERS_DIR, "*.yaml")))
        if not yaml_files:
            logger.warning(f"[ProviderManager] No YAMLs found in {PROVIDERS_DIR}")
            return

        db = SessionLocal()
        configs: List[ProviderConfig] = []
        try:
            for path in yaml_files:
                with open(path, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)

                name      = data.get("name")
                db_config = db.query(APIConfig).filter(APIConfig.provider == name).first()

                # Sincronizar prioridad hacia la DB si el registro existe
                if db_config:
                    db_config.priority     = data.get("priority", 99)
                    db_config.display_name = data.get("display_name", name)
                    db.commit()
                else:
                    # Crear registro inicial si no existe
                    env_key = data.get("connection", {}).get("api_key_env", "")
                    api_key = os.getenv(env_key, "") if env_key else ""
                    db_config = APIConfig(
                        provider=name,
                        api_key=api_key,
                        base_url=data.get("connection", {}).get("base_url", ""),
                        status="active" if (data.get("enabled", True) and api_key) else "inactive",
                        cost_per_gen=data.get("cost_per_gen", 5),
                        priority=data.get("priority", 99),
                        health_score=100,
                        display_name=data.get("display_name", name),
                    )
                    db.add(db_config)
                    db.commit()
                    db.refresh(db_config)

                configs.append(ProviderConfig(data, db_config))
                logger.info(f"[ProviderManager] Loaded: {name} (priority {data.get('priority')})")

            self._providers = sorted(configs, key=lambda p: p.priority)
            logger.info(f"[ProviderManager] Chain: {[p.name for p in self._providers]}")
        except Exception as e:
            logger.error(f"[ProviderManager] Error loading providers: {e}")
        finally:
            db.close()

    def reload(self) -> None:
        """Recarga los proveedores y sus adapters en caliente."""
        self._providers = []
        self._adapters = {}
        self.load_providers()
        self._init_adapters()

    # ──────────────────────────────────────────
    # Consulta del estado
    # ──────────────────────────────────────────

    def get_active_chain(self, kind: str = "music") -> List[ProviderConfig]:
        """Devuelve la cadena activa filtrada por tipo (music | lyrics).

        kind="music"  → providers con kind in ("music", "both")
        kind="lyrics" → providers con kind in ("lyrics", "both")
        """
        return [
            p for p in self._providers
            if p.is_available and (p.kind == kind or p.kind == "both")
        ]

    def get_all(self) -> List[ProviderConfig]:
        return self._providers

    def get_by_name(self, name: str) -> Optional[ProviderConfig]:
        for p in self._providers:
            if p.name == name:
                return p
        return None

    # ──────────────────────────────────────────
    # Registro de fallos y recuperación
    # ──────────────────────────────────────────

    def mark_failed(self, provider_name: str, reason: str) -> None:
        """Penaliza health_score -25 en DB y loguea en MongoDB."""
        from database import SessionLocal, APIConfig, failover_logs

        db = SessionLocal()
        try:
            config = db.query(APIConfig).filter(APIConfig.provider == provider_name).first()
            if config:
                penalty  = self.get_by_name(provider_name)
                p_val    = penalty.health_cfg.get("penalty_on_fail", 25) if penalty else 25
                new_score = max(0, (getattr(config, "health_score", 100) or 100) - p_val)
                config.health_score = new_score
                db.commit()
                p = self.get_by_name(provider_name)
                if p:
                    p.health_score = new_score
            logger.warning(f"[ProviderManager] {provider_name} marked failed: {reason}")
        finally:
            db.close()

        try:
            failover_logs.insert_one({
                "event":     "provider_failed",
                "provider":  provider_name,
                "reason":    reason,
                "timestamp": datetime.utcnow(),
            })
        except Exception as e:
            logger.debug(f"[ProviderManager] Mongo log skipped: {e}")

    def mark_failover(self, from_provider: str, to_provider: str, reason: str) -> None:
        """Registra un salto de failover en MongoDB."""
        from database import failover_logs

        try:
            failover_logs.insert_one({
                "event":         "failover_jump",
                "from_provider": from_provider,
                "to_provider":   to_provider,
                "reason":        reason,
                "timestamp":     datetime.utcnow(),
            })
            logger.warning(f"[ProviderManager] ⚡ FAILOVER: {from_provider} → {to_provider} ({reason})")
        except Exception as e:
            logger.debug(f"[ProviderManager] Mongo failover log skipped: {e}")

    def mark_recovered(self, provider_name: str) -> None:
        """Restaura parcialmente el health_score cuando el proveedor responde OK."""
        from database import SessionLocal, APIConfig

        db = SessionLocal()
        try:
            config = db.query(APIConfig).filter(APIConfig.provider == provider_name).first()
            if config:
                p       = self.get_by_name(provider_name)
                recover = p.health_cfg.get("recovery_on_success", 10) if p else 10
                new_score = min(100, (getattr(config, "health_score", 100) or 100) + recover)
                config.health_score = new_score
                db.commit()
                if p:
                    p.health_score = new_score
        finally:
            db.close()

    # ──────────────────────────────────────────
    # Motor de Failover
    # ──────────────────────────────────────────

    def execute_with_failover(self, task_fn, payload: dict, kind: str = "music") -> dict:
        """
        Ejecuta task_fn(provider, payload) recorriendo la cadena de proveedores
        del tipo indicado (music | lyrics).

        task_fn debe tener la firma:
            task_fn(provider: ProviderConfig, payload: dict) -> dict
        y retornar {"success": True/False, ...}

        Si todos los proveedores fallan, retorna un dict de error con detalles
        (incluye `last_error` y `tried` con la lista de providers intentados).
        """
        chain = self.get_active_chain(kind=kind)

        if not chain:
            return {
                "success":    False,
                "error":      f"No hay proveedores disponibles en la cadena de failover ({kind}).",
                "engine":     None,
                "tried":      [],
                "last_error": None,
            }

        last_error        = None
        last_provider     = None
        previous_provider = None
        tried: List[str]  = []

        for provider in chain:
            tried.append(provider.name)
            try:
                logger.info(f"[Failover] Trying: {provider.name}")
                result = task_fn(provider, payload)

                if result.get("success"):
                    self.mark_recovered(provider.name)
                    result["engine"]          = provider.name
                    result["engine_display"]  = provider.display_name
                    result["failover_active"] = previous_provider is not None
                    if previous_provider:
                        result["failover_from"] = previous_provider
                    return result
                else:
                    error_msg = result.get("error", "Error desconocido")
                    self.mark_failed(provider.name, error_msg)
                    if previous_provider:
                        self.mark_failover(previous_provider, provider.name, error_msg)
                    previous_provider = provider.name
                    last_error        = error_msg
                    last_provider     = provider.name

            except Exception as exc:
                error_msg = str(exc)
                self.mark_failed(provider.name, error_msg)
                if previous_provider:
                    self.mark_failover(previous_provider, provider.name, error_msg)
                previous_provider = provider.name
                last_error        = error_msg
                last_provider     = provider.name
                logger.error(f"[Failover] {provider.name} threw exception: {error_msg}")

        return {
            "success":       False,
            "error":         f"Todos los proveedores fallaron. Último error: {last_error}",
            "engine":        None,
            "tried":         tried,
            "last_provider": last_provider,
            "last_error":    last_error,
        }

    # ──────────────────────────────────────────
    # Toggle desde Admin
    # ──────────────────────────────────────────

    def toggle_provider(self, name: str, enabled: bool) -> dict:
        """Activa o desactiva un proveedor en la DB y recarga la cadena."""
        from database import SessionLocal, APIConfig

        db = SessionLocal()
        try:
            config = db.query(APIConfig).filter(APIConfig.provider == name).first()
            if not config:
                return {"success": False, "error": f"Proveedor '{name}' no encontrado"}
            config.status = "active" if enabled else "inactive"
            if enabled:
                config.health_score = 100  # Reset health al reactivar
            db.commit()
        finally:
            db.close()

        self.reload()
        return {"success": True, "provider": name, "enabled": enabled}


# ─── Singleton global ─────────────────────────────────────────────────────────
provider_manager = ProviderManager()
