import {PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne } from "typeorm";
import { User } from "./user.entity.js";
import { Inversion } from "./inversion.entity.js";
import type { Relation } from "typeorm";

@Entity("portafolio")
export class Portafolio {
    @PrimaryGeneratedColumn({name : "id_portafolio", type : "int"})
    id_portafolio!: number;

    @Column({name : "id_usuario", type : "int",  nullable : false})
    IdUsuario!: number;

    @Column({name : "nombre_portafolio", type : "varchar", length : 100, nullable : false})
    NombrePortafolio!: string;

    @Column({name : "fecha_creacion", type : "timestamp", nullable : false, default : () => "CURRENT_TIMESTAMP"})
    FechaCreacion!: Date;

    @ManyToOne(() => User, user => user.Portafolios)
    Usuario!: Relation<User>;

    @OneToMany(() => Inversion, inversion => inversion.IdPortafolio)
    Inversiones!: Relation<Inversion[]>;
}