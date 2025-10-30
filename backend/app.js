import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { connectDb } from './db/index.js';






const app = express();

connectDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
})
.catch((error) => {
  console.error("Failed to start server due to database connection error:", error);
});


