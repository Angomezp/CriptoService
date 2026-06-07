import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity.js";

@Entity("password_reset_token")
export class PasswordResetToken {
    @PrimaryGeneratedColumn({ name: "id_token", type: "int" })
    idToken!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_usuario" })
    usuario!: User;

    @Column({ name: "token_hash", type: "varchar", length: 255 })
    tokenHash!: string;

    @Column({ name: "expira_en", type: "timestamp" })
    expiraEn!: Date;

    @Column({ name: "usado", type: "boolean", default: false })
    usado!: boolean;

    @Column({ name: "creado_en", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    creadoEn!: Date;
}