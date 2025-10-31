import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { connectDb } from './db/index.js';






const app = express();

connectDb().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
}).catch((error) => {
  console.error("Failed to start server due to database connection error:", error);
  process.exit(1);
});



