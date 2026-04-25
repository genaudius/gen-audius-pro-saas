# Despliegue de GenAudius en AWS EC2 (Guía MVP)

Esta guía explica cómo desplegar el SaaS completo usando Docker Compose en una instancia **Ubuntu 24.04**.

## 1. Requisitos de la Instancia
- **Tipo**: t3.medium o t3.large (recomendado para correr Mongo + Postgres + Redis + Backend).
- **Disco**: 20GB+ SSD.
- **Security Group**: Abrir puertos 22 (SSH), 80 (HTTP), 443 (HTTPS), y opcionalmente 8000 si quieres probar el backend directo.

## 2. Preparación del Servidor
Conéctate vía SSH y ejecuta:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
# (Cierra sesión y vuelve a entrar para aplicar permisos de docker)
```

## 3. Clonar y Configurar
```bash
git clone https://github.com/genaudius/gen-audius-pro-saas.git
cd gen-audius-pro-saas/deployment

# Crear archivo de variables
cp .env.example .env
nano .env  # Configura tus URLs de Modal y API Keys
```

## 4. Levantar el Sistema
```bash
docker-compose -f aws-docker-compose.yml up -d
```

## 5. Acceso
- El backend estará en `http://TU_IP_AWS:8000`
- Las bases de datos están aisladas pero accesibles internamente por los nombres `postgres`, `mongo` y `redis`.
