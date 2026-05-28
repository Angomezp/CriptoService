import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import router from './config/router.js';
import "reflect-metadata";
import { AppDataSource } from './config/datasource.js';


AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("DB connection error:", error);
  });



const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

app.listen(env.serverPort, () => {
	console.log(`Server running on port ${env.serverPort}`);
});