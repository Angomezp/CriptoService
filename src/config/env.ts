import dotenv from 'dotenv';

dotenv.config();

function getEnvStr(v: string | undefined, name: string): string {
  if (v === undefined) throw new Error(`${name} is required`);
  return v;
}
function getEnvInt(v: string | undefined, name: string, d?: number): number {
  if (v === undefined) {
    if (d !== undefined) return d;
    throw new Error(`${name} is required`);
  }
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) throw new Error(`${name} must be a number`);
  return n;
}


function validateEnv() {
  const requiredEnvVars = ['SV_PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_TYPE'];
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

validateEnv();

export const env = {
    serverPort: getEnvInt(process.env.SV_PORT, 'SV_PORT'),
    dbHost: getEnvStr(process.env.DB_HOST, 'DB_HOST'),
    dbPort: getEnvInt(process.env.DB_PORT, 'DB_PORT'),
    dbUser: getEnvStr(process.env.DB_USER, 'DB_USER'),
    dbPassword: getEnvStr(process.env.DB_PASSWORD, 'DB_PASSWORD'),
    dbName: getEnvStr(process.env.DB_NAME, 'DB_NAME'),
    dbType: getEnvStr(process.env.DB_TYPE, 'DB_TYPE')
};