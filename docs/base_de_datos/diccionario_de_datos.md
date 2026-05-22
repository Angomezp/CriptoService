# Diccionario de Datos

**Proyecto:** Análisis de Criptomonedas — Grupo 9  
**Motor de base de datos:** PostgreSQL

---

## Tabla: `usuario`

Almacena la información de los usuarios registrados en el sistema, incluyendo credenciales de autenticación y configuración de MFA.

| Campo | Tipo de dato | Longitud | PK / FK | Restricciones | Descripción |
|---|---|---|---|---|---|
| id_usuario | serial | - | PK | NOT NULL, AUTO | Identificador único del usuario. Se autoincrementa. |
| nombre | varchar | 100 | - | NOT NULL | Nombre completo del usuario. Cifrado con AES-256. |
| correo | varchar | 255 | - | NOT NULL, UNIQUE | Correo electrónico del usuario. Cifrado con AES-256. No puede repetirse. |
| password_hash | varchar | 255 | - | NOT NULL | Hash de la contraseña generado con bcrypt. Nunca se almacena la contraseña en texto plano. |
| totp_secret | varchar | 255 | - | NULL permitido | Clave secreta para TOTP (Google Authenticator). Cifrada con AES-256. NULL si el usuario no ha activado MFA. |
| mfa_enabled | boolean | - | - | NOT NULL, DEFAULT false | Indica si el usuario tiene MFA activado. false por defecto hasta que confirme el primer código TOTP. |

---

## Tabla: `portafolio`

Representa el portafolio de inversiones de un usuario. Un usuario puede tener múltiples portafolios.

| Campo | Tipo de dato | Longitud | PK / FK | Restricciones | Descripción |
|---|---|---|---|---|---|
| id_portafolio | serial | - | PK | NOT NULL, AUTO | Identificador único del portafolio. Se autoincrementa. |
| id_usuario | integer | - | FK → usuario | NOT NULL | Referencia al usuario propietario del portafolio. Un usuario puede tener muchos portafolios. |
| nombre_portafolio | varchar | 100 | - | NOT NULL | Nombre descriptivo del portafolio asignado por el usuario. |
| fecha_creacion | timestamp | - | - | NOT NULL, DEFAULT now() | Fecha y hora de creación del portafolio. Se genera automáticamente. |

---

## Tabla: `inversion`

Registra cada inversión individual dentro de un portafolio. Almacena la criptomoneda, cantidad y costo al momento de la inversión.

| Campo | Tipo de dato | Longitud | PK / FK | Restricciones | Descripción |
|---|---|---|---|---|---|
| id_inversion | serial | - | PK | NOT NULL, AUTO | Identificador único de la inversión. Se autoincrementa. |
| id_portafolio | integer | - | FK → portafolio | NOT NULL | Referencia al portafolio al que pertenece la inversión. Un portafolio puede tener muchas inversiones. |
| criptomoneda | varchar | 50 | - | NOT NULL | Nombre o símbolo de la criptomoneda invertida. Ejemplo: BTC, ETH. |
| cantidad | numeric | 18,8 | - | NOT NULL | Cantidad de criptomoneda adquirida. Hasta 8 decimales para precisión en cripto. |
| costo_inicial | numeric | 18,2 | - | NOT NULL | Precio total pagado por la cantidad de criptomoneda al momento de la inversión, en USD. |
| fecha_inversion | timestamp | - | - | NOT NULL, DEFAULT now() | Fecha y hora en que se registró la inversión. |

---

## Relaciones

| Relación | Tipo | Descripción |
|---|---|---|
| usuario → portafolio | 1 a N | Un usuario puede tener muchos portafolios. Un portafolio pertenece a exactamente un usuario. |
| portafolio → inversion | 1 a N | Un portafolio puede tener muchas inversiones. Una inversión pertenece a exactamente un portafolio. |

---

## Notas de seguridad

- Los campos `nombre`, `correo` y `totp_secret` se almacenan cifrados con AES-256 en la base de datos.
- El campo `password_hash` nunca almacena la contraseña en texto plano, solo el hash generado con bcrypt.
- El campo `totp_secret` puede ser NULL mientras el usuario no haya activado MFA.
- La ganancia o pérdida de una inversión no se almacena en la base de datos, se calcula dinámicamente comparando `costo_inicial` con el precio actual obtenido de la API externa.
