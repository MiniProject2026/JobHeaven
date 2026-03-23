import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import userRoutes from './routes/user';

const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});