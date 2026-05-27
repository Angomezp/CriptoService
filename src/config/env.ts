import dotenv from 'dotenv';

dotenv.config();

function validateEnv() {
  const requiredEnvVars = ['SV_PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

validateEnv();

export const env = {
    serverPort: Number(process.env.SV_PORT),
    dbHost: process.env.DB_HOST,
    dbPort: Number(process.env.DB_PORT),
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME
};