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
    ssl: false,
    entities: ["src/entities/**/*.ts"],  //CHANGE ON PRODUCTION: Use .js for compiled code
    subscribers: [],
    migrations: [],
});