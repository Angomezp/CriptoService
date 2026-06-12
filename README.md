# CriptoService

> Servicio de backend para análisis y predicción de precios de criptomonedas.

Pequeña API en TypeScript (Node.js) que consume un servicio ML (Python) para obtener predicciones, y expone endpoints para autenticación, inversiones y predicciones.

## Tecnologías

- Node.js + TypeScript
- Express
- Axios (para integraciones con el servicio ML)
- Nodemailer (envío de correos)
- PostgreSQL / TypeORM
- Python (microservicio ML en `ml_service/`)
- Vitest para tests

## Requisitos

- Node.js 18+ (o versión compatible)
- Python 3.8+ (si vas a ejecutar el microservicio `ml_service` localmente)
- Postgres si vas a levantar la base de datos

## Instalación

1. Instala dependencias:

```bash
npm install
```

2. Configura variables de entorno

Hay un archivo de ejemplo en la raíz: `.env.example`. Cópialo a `.env` y completa los valores requeridos:

```bash
cp .env.example .env
# luego edita .env
```

El fichero `.env.example` contiene todas las variables necesarias (DB, SMTP, JWT, ML service, etc.).

## Comandos útiles

- Desarrollo (arranca la app con `tsx`):

```bash
npm run dev
```

- Build y start de producción:

```bash
npm run build
npm start
```

- Tests:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

- Scripts del microservicio ML (dentro de `package.json`):

```bash
npm run ml_service_start    # Ejecuta el servicio ML (usa python -m ml_service.main)
npm run ml_service_docs     # Genera docs del microservicio ML
```

## Estructura relevante

Resumen de carpetas y archivos importantes:

- `src/` — aplicación TypeScript (API server). Estructura principal:
    - `controllers/` — controladores HTTP
    - `services/` — lógica de negocio (envío de correos, integración con ML, autenticación, etc.)
    - `repositories/` — acceso a datos (Postgres/TypeORM)
    - `routes/` — definición de rutas/endpoint
    - `dtos/`, `entities/`, `mappers/` — modelos y mapeos
    - `security/` — utilidades de cifrado, JWT, TOTP
    - `handlers/` — middleware/handlers (errores, autenticación)
    - `tests/` — tests unitarios del backend (`src/tests/unit`, `src/tests/integration`)

- `ml_service/` — microservicio Python que sirve el modelo ML y endpoints de predicción:
    - `main.py` — arranque del servicio
    - `api/` — controllers/serializers y documentación OpenAPI
    - `models/` — lugar donde se guardan los modelos serializados (`.joblib`)

- `docs/` — documentación del proyecto:
    - `api/` — especificaciones OpenAPI y documentación de la API
    - `api_ml_service/` — documentación específica del microservicio ML
    - `arquitectura/` — notas sobre la arquitectura
    - `base_de_datos/` — diccionario y scripts de base de datos

- `config/`, `src/config/` — utilidades y carga de variables de entorno
- `tests/` — carpeta raíz con pruebas adicionales (si aplica)

Ejecuta `npm run test` para correr la suite completa (Vitest).

## Notas

- Los tests unitarios usan mocks para `axios` y `nodemailer`; ver `src/tests/unit/mocks/`.
