import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Portafolio } from './portafolio.entity.js';
import type { Relation } from 'typeorm';

@Entity('inversion')
export class Inversion {
    @PrimaryGeneratedColumn({ name: 'id_inversion', type: 'int' })
    idInversion!: number;

    @Column({ name: 'id_portafolio', type: 'int', nullable: false })
    idPortafolio!: number;

    @Column({
        name: 'criptomoneda',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    criptomoneda!: string;

    @Column({
        name: 'cantidad',
        type: 'decimal',
        precision: 18,
        scale: 8,
        nullable: false,
    })
    cantidad!: number; // 8 decimales para soportar fracciones reales de Bitcoin/Ethereum

    @Column({
        name: 'costo_inicial',
        type: 'decimal',
        precision: 18,
        scale: 2,
        nullable: false,
    })
    costoInicial!: number; // Valor de compra teórico expresado en USD

    @Column({
        name: 'fecha_inversion',
        type: 'timestamp',
        default: () => 'NOW()',
    })
    fechaInversion!: Date;

    // Relación correcta: La inversión depende directamente de la existencia del Portafolio
    @ManyToOne(() => Portafolio, (portafolio) => portafolio.inversiones, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'id_portafolio' })
    portafolio!: Relation<Portafolio>;
}
