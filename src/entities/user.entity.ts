import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Portafolio } from "./portafolio.entity.js";

@Entity("usuario")
export class User {
    @PrimaryGeneratedColumn({ name: "id_usuario", type: "int" })
    idUsuario!: number;

    @Column({ name: "nombre", type: "varchar", length: 100, nullable: false })
    nombre!: string; // Los datos aquí irán cifrados con AES-256 en DB

    @Column({ name: "correo", type: "varchar", length: 255, unique: true, nullable: false })
    correo!: string; // Los datos aquí irán cifrados con AES-256 en DB

    @Column({ name: "password_hash", type: "varchar", length: 255, nullable: false })
    passwordHash!: string; // Almacenará el hash Bcrypt con salt aleatorio

    @Column({ name: "totp_secret", type: "varchar", length: 255, nullable: true })
    totpSecret!: string | null; // Llave simétrica MFA cifrada con AES-256

    @Column({ name: "mfa_enabled", type: "boolean", default: false })
    mfaEnabled!: boolean;

    @Column({ name: "intentos_fallidos", type: "int", default: 0 })
    intentosFallidos!: number; // Contador para bloqueo automático tras 5 intentos fallidos

    @Column({ name: "bloqueado_hasta", type: "timestamp", nullable: true })
    bloqueadoHasta!: Date | null;

    // Relación correcta: Un usuario puede tener múltiples portafolios simulados
    @OneToMany(() => Portafolio, (portafolio) => portafolio.usuario)
    portafolios!: Portafolio[];
}