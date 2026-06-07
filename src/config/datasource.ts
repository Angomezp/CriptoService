import { env } from './env.js';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.dbHost,
    port: env.dbPort,
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    synchronize: true,
    logging: false,
    ssl: {
        rejectUnauthorized: false
    },
    entities: ["src/entities/**/*.ts"],
    subscribers: [],
    migrations: [],
});