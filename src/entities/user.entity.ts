import {PrimaryGeneratedColumn, Column, Entity, OneToMany} from "typeorm";
import { Portafolio } from "./portafolio.entity.js";
import type { Relation } from "typeorm";

@Entity("usuario")
export class User {
    @PrimaryGeneratedColumn({name : "id_usuario", type : "int"})
    id_usuario!: number;

    @Column({name : "nombre", type : "varchar", length : 100, nullable : false})
    NombreCompleto!: string;

    @Column({name : "correo", type : "varchar", length : 255, nullable : false, unique : true})
    Correo!: string;

    @Column({name : "password_hash", type : "varchar", length : 255, nullable : false})
    PasswordHash!: string;

    @Column({name : "totp_secret", type : "varchar", length : 255, nullable : true})
    TOTPSecret!: string;

    @Column({name : "mfa_enabled", type : "boolean", nullable : false, default : false})
    MFAEnabled!: boolean;

    @OneToMany(() => Portafolio, portafolio => portafolio.IdUsuario)
    Portafolios!: Relation<Portafolio[]>;

}