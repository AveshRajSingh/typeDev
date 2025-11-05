import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDb } from './db/index.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRouter from './routes/user.route.js';
app.use("/users", userRouter);

connectDb().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
}).catch((error) => {
  console.error("Failed to start server due to database connection error:", error.message);
  process.exit(1);
});
