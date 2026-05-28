# Documentación de Arquitectura

**Proyecto:** Análisis de Criptomonedas — Grupo 9  
**Motor de base de datos:** PostgreSQL  
**Entorno de despliegue:** Servidor en la nube  
**Tecnologías principales:** Node.js + TypeScript + Express (backend), Python (servicio de predicciones)

---

## 1. Estilo arquitectónico

El sistema adopta una combinación de estilos arquitectónicos: **Monolito con Servicio Auxiliar** y **Arquitectura en Capas**.

### 1.1 Monolito con Servicio Auxiliar

El núcleo del sistema es un monolito construido en Node.js con TypeScript y Express. Todo el backend principal (autenticación, criptomonedas, portafolio) vive dentro de esta única aplicación.

Sin embargo, el módulo de predicciones requiere modelos de Machine Learning (regresión lineal, medias móviles) que son significativamente más fáciles de implementar en Python gracias a librerías especializadas como `scikit-learn` que no tienen equivalente sólido en TypeScript. Por esta razón, las predicciones se implementan como un **servicio auxiliar en Python** que corre como proceso separado y se comunica con el monolito principal mediante HTTP.

Esta decisión no convierte la arquitectura en microservicios porque solo se extrae una parte muy específica del sistema. El resto sigue siendo un monolito cohesionado.

- Para gestionar el **Portafolio**, primero necesitamos saber con certeza qué usuario inició sesión (**Autenticación**).
- Para generar **Predicciones**, el Prediction Service del monolito consulta al servicio Python por HTTP y devuelve el resultado al cliente.

### 1.2 Arquitectura en Capas

Internamente, el monolito se organiza en capas con una dirección de dependencia estricta: cada capa solo conoce a la capa inmediatamente inferior y nunca al revés.

| Capa | Responsabilidad Técnica |
|---|---|
| **Capa de Presentación (Controllers)** | Punto de entrada de la API. Recibe las peticiones HTTP externas, extrae los parámetros, valida los datos de entrada y delega el trabajo al servicio correspondiente. |
| **Servicios (Services)** | Capa del núcleo o lógica de negocio. Es donde se procesan las reglas del sistema (cálculos de portafolios, lógica de registro, predicciones) y se coordinan las llamadas a los módulos de apoyo. |
| **Repositorios (Repositories)** | Capa de acceso a datos. Su única función es comunicarse con PostgreSQL para consultar, insertar o actualizar la información utilizando los modelos como estructura. |

```
Controllers
    ↓
Services
    ↓
Repositories
```

Esta organización garantiza que cada capa tenga una única responsabilidad y pueda ser modificada sin afectar a las demás.

---

## 2. Estructura del proyecto

### Monolito principal (Node.js + TypeScript + Express)

```
proyecto_cripto/
│
├── controllers/
│   ├── auth_controller       → endpoints /register, /login, /verify-mfa
│   ├── crypto_controller     → endpoints /prices, /history
│   ├── portfolio_controller  → endpoints /portfolio, /investment
│   └── prediction_controller → endpoint /prediction
│
├── services/
│   ├── auth_service          → lógica de registro y login
│   ├── crypto_service        → consulta a API externa de precios (CoinGecko)
│   ├── portfolio_service     → lógica de portafolio e inversiones
│   └── prediction_service    → recibe la petición y consulta al servicio Python ML por HTTP
│
├── repositories/
│   ├── user_repository       → operaciones sobre tabla usuario
│   └── portfolio_repository  → operaciones sobre tablas portafolio e inversion
│
├── models/
│   ├── user_model            → representa la tabla usuario
│   ├── portfolio_model       → representa la tabla portafolio
│   └── investment_model      → representa la tabla inversion
│
├── security/
│   ├── encryption            → cifrado y descifrado AES-256
│   ├── hashing               → hash y verificación con bcrypt
│   ├── jwt_handler           → generación y verificación de JWT
│   └── totp_handler          → generación del secret, QR y verificación TOTP
│
├── config/
│   ├── database              → configuración de conexión a PostgreSQL
│   ├── env.ts
│   └── router.ts
│
└── main                      → punto de entrada, arranca el servidor Express
```

### Servicio auxiliar de ML (Python)

```
ml_service/
│
├── model/
│   └── predictor             → implementa regresión lineal y medias móviles
│
└── main                      → arranca el servidor Python y expone el endpoint de predicción
```

---

## 3. Módulo de seguridad

La capa de seguridad es transversal, es decir, no pertenece a un solo dominio sino que es invocada por todos los services según lo requieran.

| Módulo | Tecnología | Responsabilidad |
|---|---|---|
| encryption | AES-256 | Cifrar y descifrar datos personales (nombre, correo, totp_secret) |
| hashing | bcrypt | Hashear contraseñas al registrar y verificarlas al hacer login |
| jwt_handler | JWT | Generar el token de sesión tras login exitoso y verificarlo en cada petición |
| totp_handler | TOTP (RFC 6238) | Generar la clave secreta, el QR y verificar el código de 6 dígitos del MFA |

---

## 4. Flujo de autenticación

```
1. Usuario envía correo + contraseña → Auth Controller
2. Auth Controller delega → Auth Service
3. Auth Service verifica credenciales con bcrypt (hashing)
4. Si las credenciales son correctas:
   - Si el usuario tiene MFA activo: El servidor entrega un token temporal de sesión y solicita el código del MFA.
   - Si el usuario NO tiene MFA: El servidor entrega el token definitivo y finaliza el proceso.
5. (Para MFA activo) Usuario envía el código MFA + el token temporal → Auth Controller (POST /auth/verify-mfa)
6. Auth Controller valida el token temporal y obtiene la identidad del usuario
7. Auth Service recupera el secret cifrado de la BD (user_repository)
8. Auth Service descifra el secret (encryption) y verifica el código (totp_handler)
9. Si el código es correcto, Auth Service genera el token definitivo y se devuelve al cliente
```

## 5. Flujo de predicciones

```
1. Usuario solicita predicción → Prediction Controller
2. Prediction Controller delega → Prediction Service
3. Prediction Service consulta precios históricos → Crypto Service → CoinGecko
4. Prediction Service envía los datos históricos al servicio Python ML por HTTP
5. Servicio Python aplica el modelo (regresión lineal o medias móviles)
6. Servicio Python devuelve el resultado al Prediction Service
7. Prediction Service devuelve la predicción al cliente
```

---

## 6. Entorno de despliegue

El sistema se despliega en un servidor en la nube con dos procesos corriendo simultáneamente:

- **Monolito Node.js:** el backend principal con todas las capas
- **Servicio ML Python:** el proceso auxiliar que calcula las predicciones

Ambos procesos corren en el mismo servidor. La comunicación entre ellos es local por HTTP. Los servicios externos (CoinGecko) son consumidos por el monolito mediante HTTP.

---

