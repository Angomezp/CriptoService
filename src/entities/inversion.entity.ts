import {PrimaryGeneratedColumn, Column, Entity, ManyToOne} from "typeorm";
import { Portafolio } from "./portafolio.entity.js";
import type { Relation } from "typeorm";

@Entity("inversion")
export class Inversion {
    @PrimaryGeneratedColumn({name : "id_inversion", type : "int"})
    id_inversion!: number;

    @Column({name : "id_usuario", type : "int",  nullable : false})
    IdUsuario!: number;

    @Column({name : "id_portafolio", type : "int", nullable : false})
    IdPortafolio!: number;

    @Column({name : "criptomoneda", type : "varchar", length : 50, nullable : false})
    Criptomoneda!: string;

    @Column({name : "cantidad", type : "decimal", precision : 18, scale : 8, nullable : false})
    Cantidad!: number;

    @Column({name : "costo_inicial", type : "decimal", precision : 18, scale : 2, nullable : false})
    PrecioCompra!: number;

    @Column({name : "fecha_inversion", type : "timestamp", nullable : false, default : () => "CURRENT_TIMESTAMP"})
    FechaInversion!: Date;

    @ManyToOne(() => Portafolio, portafolio => portafolio.Inversiones)
    Portafolio!: Relation<Portafolio>;
    

}