import cors from 'cors';
import express from 'express';
import 'reflect-metadata';
import { appDataSource } from './config/datasource.js';
import { env } from './config/env.js';
import router from './config/router.js';
import { errorHandler } from './handlers/error.handler.js';

async function main() {
    try {
        await appDataSource.initialize();
        console.log('Database connected');

        const app = express();

        app.use(cors());
        app.use(express.json());
        app.use('/api', router);

        app.listen(env.serverPort, () => {
            console.log(`Server running on port ${env.serverPort}`);
        });
        app.use(errorHandler);
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

main();
