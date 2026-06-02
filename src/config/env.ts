import 'dotenv/config';

export const env = {
  dbHost: process.env.DB_HOST,
  dbPort: Number(process.env.DB_PORT),
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  serverPort: Number(process.env.PORT),
};