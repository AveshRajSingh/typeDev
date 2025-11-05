import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDb } from './db/index.js';

console.log(process.env.EMAIL_PASS);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
}).catch((error) => {
  console.error("Failed to start server due to database connection error:", error.message);
  process.exit(1);
});


import userRouter from './routes/user.route.js';

app.use("/users", userRouter);



