export interface User {
  id_usuario?: number
  nombre: string
  correo: string
  password_hash: string
  totp_secret?: string | null
  mfa_enabled: boolean
}