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

✅ **Done & validated (13/13 tests passed)**:
- `backend/core/auth.py` con bcrypt + JWT HS256 (rehash invisible SHA-256→bcrypt)
- Login/social emiten JWT real con `sub`, `role`, `exp`
- `_get_user_id` valida JWT (con `LEGACY_HEADER_AUTH` para migración)
- Stripe webhook fail-closed en producción
- Función duplicada `get_system_health` eliminada
- Frontend envía `Authorization: Bearer ${ga_token}`
- `MODAL_API_KEY` filtrada removida de `.env.example`
- `.gitignore` actualizado, 3 archivos `.db` sacados del tracking

---

## Session: Option B — Modularization & Bundle Optimization (Jan 2026)

### Backend modularization (validated, 21/21 tests passed)
**Antes**: `main.py` = 2 608 líneas (todo monolítico).
**Después**: `main.py` = 2 230 líneas + módulos limpios:
- `backend/schemas.py` (166 LOC) — todos los Pydantic models centralizados
- `backend/deps.py` (122 LOC) — `get_db`, `get_user_id`, `require_admin`, `verify_saas_api_key`, `deduct_credits_atomic`
- `backend/routers/auth.py` (171 LOC) — `/api/auth/login|me|social|verify`
- `backend/routers/wallet.py` (137 LOC) — `/api/user/wallet|recharge|earnings|payout`
- `backend/routers/content.py` (50 LOC) — `/api/blog`, `/api/legal/all|{slug}`
- `backend/routers/billing.py` (126 LOC) — `/api/stripe/create-checkout-session|webhook`

**Bug latente arreglado**: `BlogPost` no tenía `created_at`/`updated_at` y el endpoint
`/api/blog` tiraba 500. Añadidas las columnas + migración SQLite/Postgres idempotente.

### Frontend code-splitting + idle prefetch
**Antes**: bundle único `index.js` ≈ 591 KB (191 KB gzip).
**Después**: bundle inicial = **359 KB (113 KB gzip)** — ↓ **39 % reducción**.

Páginas convertidas a `React.lazy()` con `<Suspense fallback={<CDLoader />}>`:
StudioLayout, SuperAdminPanel, PageCreatorV3, PagePlans, PageCheckout, PageExplore,
PageLibrary, PageDashboard, PageAdmin, PageProfileSettings, PageLegalView, SupportHub.

Vendor chunks separados via `vite.config.js` `manualChunks`:
- `vendor-react` (3.6 KB) — react+react-dom
- `vendor-motion` (134 KB / 44 KB gzip) — framer-motion
- `vendor-firebase` (97 KB / 29 KB gzip) — solo se carga al abrir LoginModal
- `vendor-icons` (22 KB / 8 KB gzip) — lucide-react
- `vendor-idb` (3.4 KB) — IndexedDB wrapper

**Idle prefetch** (`src/utils/prefetch.js`): después de `window.load`, en tiempo idle
del browser (`requestIdleCallback`), pre-warma secuencialmente los chunks más probables:
StudioLayout → PageCreatorV3 → PageExplore → PageLibrary → PagePlans. Cuando el
usuario hace click, la transición se siente instantánea porque los chunks ya están en
caché. Best-effort: errores de prefetch se ignoran.

**Beneficio extra**: vendor chunks cacheados independientemente. En deploys que solo
tocan código de la app, el browser no re-descarga react/firebase/motion/etc.

### Archivos creados/modificados
- ✨ Nuevos: `backend/schemas.py`, `backend/deps.py`, `backend/routers/{__init__,auth,wallet,content,billing}.py`
- 📝 Editados: `backend/main.py`, `backend/database.py`, `frontend/src/App.jsx`, `frontend/vite.config.js`

---

## Manual actions still required by user (from Option A)
1. **Rotar `MODAL_API_KEY`** — la previa (`ak-iS5tmkHUKb26JuYgbCCyr3`) está en histórico público de git.
2. **Generar `JWT_SECRET` para producción**: `python -c "import secrets; print(secrets.token_hex(64))"`
3. Mantener `LEGACY_HEADER_AUTH=true` mientras se despliega frontend nuevo, luego `false`.
4. (Opcional) Reescribir histórico git con BFG para purgar las DB SQLite filtradas.

## Backlog (P1 — diferido)
- **Cifrar `EmailConfig.smtp_pass`** en DB con Fernet
- **Verificar Firebase ID token** real en `/api/auth/social` con `firebase_admin`
- **Migrar `datetime.utcnow()`** a `datetime.now(timezone.utc)`
- **Migrar `@validator` de Pydantic v1** a `@field_validator` v2
- **Memory leak en rate limiter fallback**: `request_history` sin TTL
- **Alembic** en lugar del `_migrate_columns` manual
- **Tests + CI**: GitHub Actions con pytest y vitest
- **Sentry / OpenTelemetry** para errores y trazas en producción
- **Background jobs** (Celery/RQ) para generación de música
- **Política de retención** para `static/exports/*.mp3`
- **Refresh tokens** (hoy solo access token de 24 h)

---

## Session: MCP Integration (GenAudius MCP @ Hostinger VPS) — Jan 2026

### Architecture wired
```
Frontend → Backend FastAPI (AWS / preview) → MCP @ Hostinger VPS → Modal → R2
```

### Files added
- `backend/services/mcp_client.py` (101 LOC) — async httpx client wrapping the MCP HTTP API:
  - `health()`, `list_tools()`, `call_tool(name, args)`, `batch(steps)`
  - Tolerant JSON parsing (returns `_warning: non_json_response` instead of crashing)
- `backend/routers/mcp.py` (115 LOC) — public + authenticated + admin endpoints:
  - `GET /api/mcp/health` (public proxy)
  - `GET /api/mcp/tools` (admin)
  - `POST /api/mcp/call/{tool_name}` (authed user, with credit deduction)
  - `GET /api/admin/mcp/status` (combined dashboard: gateway_health + analytics + chatgau)
- Per-tool credit costs in `TOOL_CREDIT_COST` dict (e.g. generate_song=20, separate_stems=15, chatgau_quick=0)

### Live integration validated
- 27 MCP tools listed via `GET /api/mcp/tools`
- `list_versions`: returned V1/V2/V3 metadata ✅
- `build_prompt`: deducted 1 credit (100588 → 100587) ✅
- `gateway_health`, `get_system_status`: ✅

### Bug found in user's VPS Nginx (Option C: not fixed; works via api.genaudius.cloud)
- `/etc/nginx/conf.d/default.conf` inside container `genaudius_nginx` had a placeholder
  `location / { return 200 '{" status\:\ok\,\mcp\:\GenAudius\}'; }` shadowing all routes
  on `genaudius.cloud`. Real MCP only reachable via `api.genaudius.cloud/mcp/*`.
- Real MCP API key is `mcp_genaudius_2026` (NOT the previous `ga-prod-master-key-2026`).
- Backend `.env` updated:
  ```
  MCP_BASE_URL=https://api.genaudius.cloud/mcp
  MCP_API_KEY=mcp_genaudius_2026
  ```

### Action required by user (production AWS .env)
Add to backend `.env` on AWS:
```
MCP_BASE_URL=https://api.genaudius.cloud/mcp
MCP_API_KEY=mcp_genaudius_2026
MCP_TIMEOUT_SECONDS=600
```

### Backlog
- (Optional) Wire `/api/music/generate` and friends to call MCP `generate_song`
  instead of direct provider, with fallback chain.
- Frontend: add "MCP Status" card in Admin Panel that calls `/api/admin/mcp/status`.


- **Eliminar deps muertas**: `@react-three/drei`, `@react-three/fiber` no se usan en src

## Backlog (P2 — nice to have)

- Logging estructurado JSON (structlog)
- i18n en mensajes de error backend
- Webhook de Modal cuando termine renderizado
- Multi-stage Dockerfile + HEALTHCHECK
- Paginación en `/api/admin/tasks`, `/api/admin/legal`
- Eliminar duplicidad Firebase auth + custom auth (decidir uno)
