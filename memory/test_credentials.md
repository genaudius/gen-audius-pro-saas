# Test Credentials — Gen Audius Pro

## Admin (production)
- **Email**: `genaudius@gmail.com`
- **Role**: `admin` (configurado vía `ADMIN_EMAIL` env var)
- **Password**: configurado por el usuario; reset con `backend/seed_admin.py`
  o `backend/create_user.py`.

## Local test user (creado solo durante validación de Option A)
- **Email**: `legacy@test.com`
- **Password**: `MyOldPass123` (rehashado a bcrypt al primer login)
- **User ID**: `u_legacy_test`
- **Hash type**: bcrypt (`$2b$12$...`) tras login

## Auth Endpoints
- `POST /api/auth/login` — email + password → `{token, user_id, role, ...}`
- `POST /api/auth/social` — Firebase social login → `{token, user_id, role, ...}`
- `GET  /api/auth/me` — requiere `Authorization: Bearer <jwt>`
- `GET  /api/auth/verify?token=...` — verificación de email

## Required env vars (production)
- `JWT_SECRET` — **64-char hex random** (genera con
  `python -c "import secrets; print(secrets.token_hex(64))"`)
- `ENV=production`
- `LEGACY_HEADER_AUTH=false` (después de migración)
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `MODAL_API_KEY=...` ⚠️ (rotar la actual: la previa está expuesta en git)
