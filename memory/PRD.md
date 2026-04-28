# Gen Audius Pro — PRD & Change Log

## Project
SaaS de producción musical con IA. Stack: FastAPI + SQLAlchemy (SQLite/Postgres) +
React + Vite + Firebase. Despliegue actual: GCP / AWS (ya en producción).

## Personas
- **Admin** (`genaudius@gmail.com`) — gestiona configuración, blog, legales, providers.
- **Artista / Productor / DJ** — consume créditos para generar música, masterizar, publicar.
- **Usuario free / pro / studio** — planes con distintos límites.

---

## Session: Option A — Critical Security Hardening (Jan 2026)

### Problem
Auditoría detectó 5 P0 críticos:
1. Auth basada en header `X-User-ID` no firmado (impersonación trivial).
2. Passwords con SHA-256 + sal estática pública.
3. `MODAL_API_KEY` real filtrada en `.env.example` committeado.
4. Stripe webhook acepta eventos sin firma cuando falta `WEBHOOK_SECRET`.
5. Función `get_system_health` duplicada → código muerto.
6. Bases de datos SQLite con datos de usuarios committeadas en git.

### Implemented
- **`backend/core/auth.py`** (nuevo): bcrypt (rounds=12) + PyJWT HS256
  con TTL configurable (`ACCESS_TOKEN_TTL_HOURS`, default 24 h).
  Helpers: `hash_password`, `verify_password`, `needs_rehash`,
  `create_access_token`, `decode_access_token`, `get_current_user_id`.
- **Migración invisible**: `verify_password` detecta hash legacy SHA-256 y
  lo acepta en el primer login; `login()` rehasha automáticamente a bcrypt.
  Cero downtime para usuarios existentes.
- **`POST /api/auth/login`** y **`POST /api/auth/social`** ahora emiten JWT
  real (`sub`, `email`, `role`, `exp`) en lugar del SHA-256 random.
- **`_get_user_id`** valida JWT desde `Authorization: Bearer`.
  Modo `LEGACY_HEADER_AUTH=true` (env) acepta el header viejo durante migración.
- **Stripe webhook**: rechaza con 503 cuando `ENV=production` y
  `STRIPE_WEBHOOK_SECRET` está vacío.
- **`get_system_health` duplicado**: stub de líneas 1156–1164 reemplazado por
  el chequeo real (DB + Redis + Mongo + maintenance flag); huérfano de
  línea 1215 eliminado.
- **`.env.example`**: `MODAL_API_KEY=ak-iS5tmkHUKb26JuYgbCCyr3` reemplazado
  por placeholder. Añadidos `JWT_SECRET`, `ACCESS_TOKEN_TTL_HOURS`,
  `LEGACY_HEADER_AUTH`, `ENV`.
- **`.gitignore`**: añadido `*.db`, `*.sqlite*`. Tres archivos `.db` removidos
  del tracking de git (`backend/audius.db`, `backend/gen_audius_dev.db`,
  `gen_audius_dev.db`).
- **Frontend**: `DatabaseContext.jsx`, `aiService.js`, `ProviderEngine.js`,
  `PageDevAgent.jsx` actualizados para enviar `Authorization: Bearer ${ga_token}`
  además del legacy `X-User-ID`.
- **Scripts**: `seed_superadmin.py` y `create_user.py` ahora usan bcrypt.

### Validation (13/13 tests passed)
- Login legacy SHA-256 → JWT + rehash automático en DB
- Wrong password → 401
- JWT válido en `/api/auth/me` → 200
- JWT manipulado / inválido → 401
- Sin auth → 401
- Modo legacy: `X-User-ID` sigue funcionando (con warning)
- Modo producción: webhook Stripe sin secret → 503 (fail-closed)
- Modo producción: `X-User-ID` solo → 401 (rechazado)
- OpenAPI: solo una ruta `/api/admin/system/health`

### Manual actions required by user (cannot be automated)
1. **Rotar `MODAL_API_KEY`** — la clave `ak-iS5tmkHUKb26JuYgbCCyr3` ya está
   en histórico público de git. Revoca y emite una nueva en Modal.
2. **Generar `JWT_SECRET` para producción**:
   `python -c "import secrets; print(secrets.token_hex(64))"`
   y agregar al `.env` de producción.
3. **(Opcional) Reescribir histórico de git** para purgar las DB SQLite
   filtradas: usar [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/).
4. **Migración del frontend**: el código nuevo envía `Authorization: Bearer`.
   Mantener `LEGACY_HEADER_AUTH=true` mientras se despliega frontend nuevo,
   luego cambiarlo a `false`.

---

## Backlog (P1 — diferido)

- **Modularizar `main.py`** (2 608 líneas) en `routers/auth.py`, `music.py`,
  `admin.py`, `stripe.py`, `blog.py`, `legal.py`.
- **Code-splitting frontend**: lazy-load DAW, three.js, OpenDAW SDK.
- **Cifrar `EmailConfig.smtp_pass`** en DB con Fernet.
- **Verificar Firebase ID token** real en `/api/auth/social` con
  `firebase_admin` (requiere Service Account JSON del usuario).
- **Migrar `datetime.utcnow()`** a `datetime.now(timezone.utc)`.
- **Migrar `@validator` de Pydantic v1** a `@field_validator` v2.
- **Memory leak en rate limiter fallback**: `request_history` sin TTL.
- **Alembic** en lugar del `_migrate_columns` manual.
- **Tests + CI**: GitHub Actions con pytest y vitest.
- **Sentry / OpenTelemetry** para errores y trazas en producción.
- **Background jobs** (Celery/RQ) para generación de música.
- **Política de retención** para `static/exports/*.mp3`.
- **Refresh tokens** (hoy solo access token de 24 h).

## Backlog (P2 — nice to have)

- Logging estructurado JSON (structlog).
- i18n en mensajes de error backend.
- Webhook de Modal cuando termine renderizado.
- Multi-stage Dockerfile + HEALTHCHECK.
- Paginación en `/api/blog`, `/api/admin/tasks`, `/api/admin/legal`.
- Eliminar duplicidad Firebase auth + custom auth (decidir uno).
