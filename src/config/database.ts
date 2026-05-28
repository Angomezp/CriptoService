import { AppDataSource } from "./datasource.js";
import { DataSource } from "typeorm";

class Database {
    private static instance: DataSource | null = null;

    private constructor() {}

    public static getInstance(): DataSource {
        if (!Database.instance) {
            Database.instance = AppDataSource;
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
