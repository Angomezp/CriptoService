import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./user.entity.js";
import { Inversion } from "./inversion.entity.js";
import type { Relation } from "typeorm";

@Entity("portafolio")
export class Portafolio {
    @PrimaryGeneratedColumn({ name: "id_portafolio", type: "int" })
    idPortafolio!: number;

    @Column({ name: "id_usuario", type: "int", nullable: false })
    idUsuario!: number;

    @Column({ name: "nombre_portafolio", type: "varchar", length: 100, nullable: false })
    nombrePortafolio!: string;

    @Column({ name: "fecha_creacion", type: "timestamp", default: () => "NOW()" })
    fechaCreacion!: Date;

    // Relación muchos a uno con el Usuario (Llave Foránea)
    @ManyToOne(() => User, (usuario) => usuario.portafolios, { onDelete: "CASCADE" })
    @JoinColumn({ name: "id_usuario" })
    usuario!: Relation<User>;

    // Relación inversa: Un portafolio agrupa múltiples registros de inversión
    @OneToMany(() => Inversion, (inversion) => inversion.portafolio)
    inversiones!: Relation<Inversion[]>;
}