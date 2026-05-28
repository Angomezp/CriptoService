import { env }  from './env.js';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Portafolio } from '../entities/portafolio.entity.js';
import { Inversion } from '../entities/inversion.entity.js';

export const AppDataSource = new DataSource({
    type: env.dbType as any,
    host: env.dbHost,
    port: parseInt(String(env.dbPort)),
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,

    logging: false,
    synchronize: false,

    entities: [
        User,
        Portafolio,
        Inversion
    ]

});

