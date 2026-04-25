# Gen Audius - AI Music Creator 🚀

## Visión 🎵
Gen Audius es la plataforma de producción musical del futuro. Un entorno DAW nativo en el navegador potenciado por motores de Inteligencia Artificial como KIE y Suno. Está diseñado para que creadores, productores y artistas puedan materializar "Hits" con calidad de estudio a partir de una idea o un simple lyric. Es el puente perfecto entre la imaginación humana y la síntesis de audio de vanguardia a través del "ADN Engine".

## Modelo de Negocio 💎
El ecosistema de Gen Audius se basa en un sistema financiero de créditos ('Stitch Ledger'):
- **Recarga de Wallet:** Saldo mínimo recargable de $10 USD.
- **Micro-transacciones y Consumo:** Cada generación de canción ('Hit'), extracción de stems mediante IA, o masterización, consume una tarifa plana de créditos definida en el backend.
- **Control Total (Studio A):** Los administradores manejan el sistema a través de "Studio A" (Admin Console), que permite monitorear el consumo de la API corporativa en tiempo real, ajustar motores ("Gen Audius Internal" vs "KIE-Suno") y gestionar márgenes de ganancia.

## Estructura del Repositorio 📁

- `/frontend/`: Todo el código de React / Vite (Landing Page, Gen DAW Studio, User Profile, Admin Panel). Contiene la lógica de usuario e interfáz.
- `/backend/`: Servidor Python FastAPI, lógica híbrida de base de datos (PostgreSQL para transacciones financieras / MongoDB para historial de Hits), gestión de Wallet ('Stitch Ledger'), y adaptadores oficiales de API (KIE, Suno).
- `/models/`: Archivos `.pth` y scripts de entrenamiento de clonación vocal / RVC.
- `/docs/`: Documentación del negocio y guías de arquitectura (como este documento).
- `/assets/`: Recursos maestros de la marca oficial (Logos horizontales, verticales, e iconos para UI/UX).
