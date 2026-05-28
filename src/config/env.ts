import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    serverPort: number;
    dbHost: string;
    dbPort: number;
    dbUser: string;
    dbPassword: string;
    dbName: string;
    encryptionKey: string; 
    dbType: string;
}

function validateEnv() {
    const requiredEnvVars = ['SV_PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'ENCRYPTION_KEY', 'DB_TYPE'];
    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
}

validateEnv();

export const env: EnvConfig = {
    serverPort: Number(process.env.SV_PORT),
    dbHost: process.env.DB_HOST as string, 
    dbPort: Number(process.env.DB_PORT),
    dbUser: process.env.DB_USER as string,
    dbPassword: process.env.DB_PASSWORD as string,
    dbName: process.env.DB_NAME as string,
    encryptionKey: process.env.ENCRYPTION_KEY as string,
    dbType: process.env.DB_TYPE as string
};