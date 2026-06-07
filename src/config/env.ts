import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    serverPort: number;
    dbHost: string;
    dbPort: number;
    dbUser: string;
    dbPassword: string;
    dbType: string;
    dbName: string;
    encryptionKey: string;
    jwtSecret: string;
    jwtMfaSecret: string;
    maxIntentosLogin: number;
    bloqueoMinutos: number;
}

function validateEnv() {
    const requiredEnvVars = ['SV_PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME','DB_TYPE' ,'ENCRYPTION_KEY', 'JWT_SECRET', 'JWT_MFA_SECRET', 'MAX_INTENTOS_LOGIN', 'BLOQUEO_MINUTOS'];
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
    jwtSecret: process.env.JWT_SECRET as string,
    jwtMfaSecret: process.env.JWT_MFA_SECRET as string,
    dbType: process.env.DB_TYPE as string,
    maxIntentosLogin: Number(process.env.MAX_INTENTOS_LOGIN),
    bloqueoMinutos: Number(process.env.BLOQUEO_MINUTOS)
};