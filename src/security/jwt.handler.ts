import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function generarToken(userId: number): string {
  return jwt.sign(
    { userId },
    env.jwtSecret,
    { expiresIn: '1h' }
  )
}

export function generarMfaToken(userId: number): string {
  return jwt.sign(
    { userId, scope: 'PRE_AUTH' },
    env.jwtMfaSecret,
    { expiresIn: '3m' }
  )
}

export function verificarToken(token: string): { userId: number } {
  try {
    return jwt.verify(token, env.jwtSecret) as { userId: number }
  } catch {
    throw new Error('Token inválido o expirado')
  }
}

export function verificarMfaToken(token: string): { userId: number; scope: string } {
  try {
    return jwt.verify(token, env.jwtMfaSecret) as { userId: number; scope: string }
  } catch {
    throw new Error('Token MFA inválido o expirado')
  }
}