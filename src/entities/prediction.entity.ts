import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('prediccion')
export class Prediccion {
    @PrimaryGeneratedColumn({ name: 'id_prediccion', type: 'int' })
    idPrediccion!: number;

    @Column({
        name: 'criptomoneda',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    criptomoneda!: string;

    @Column({
        name: 'precio_calculado',
        type: 'decimal',
        precision: 18,
        scale: 4,
        nullable: false,
    })
    precioCalculado!: number; // Precio estimado por tu algoritmo estadístico backend

    @Column({
        name: 'fecha_calculo',
        type: 'timestamp',
        default: () => 'NOW()',
    })
    fechaCalculo!: Date;

    @Column({
        name: 'fecha_proyeccion_destino',
        type: 'timestamp',
        nullable: false,
    })
    fechaProyeccionDestino!: Date; // Momento del tiempo al cual apunta la predicción

    @Column({
        name: 'precio_real_alcanzado',
        type: 'decimal',
        precision: 18,
        scale: 4,
        nullable: true,
    })
    precioRealAlcanzado!: number | null; // ¡NULO por defecto! AWS Glue lo llenará al realizar el Backtesting
}
