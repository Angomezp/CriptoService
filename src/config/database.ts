import { appDataSource } from './datasource.js';
import type { DataSource } from 'typeorm';

export class Database {
    private static instance: DataSource | null = null;

    private constructor() {}

    public static getInstance(): DataSource {
        if (!Database.instance) {
            Database.instance = appDataSource;
        }
        return Database.instance;
    }

    public static async initialize(): Promise<DataSource> {
        const db = Database.getInstance();
        if (!db.isInitialized) {
            await db.initialize();
        }
        return db;
    }

    public static async close(): Promise<void> {
        const ds = Database.getInstance();
        if (ds && ds.isInitialized) {
            await ds.destroy();
        }
        Database.instance = null;
    }
}
