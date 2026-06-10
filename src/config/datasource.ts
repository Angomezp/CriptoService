import { env } from './env.js';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Prediccion } from '../entities/prediction.entity.js';
import { PasswordResetToken } from '../entities/password_reset.entity.js';
import { Portafolio } from '../entities/portafolio.entity.js';
import { Inversion } from '../entities/inversion.entity.js';

export const appDataSource = new DataSource({
    type: 'postgres',
    host: env.dbHost,
    port: env.dbPort,
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    synchronize: true,
    logging: false,
    ssl: false,
    entities: [User, Prediccion, PasswordResetToken, Portafolio, Inversion],
    subscribers: [],
    migrations: [],
});
