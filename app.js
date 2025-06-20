import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoute.js';
import quizRoutes from './routes/quizRoute.js';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

app.get('/',(req,res)=>{res.status(200).json({message:"Welcome to AI Quiz app"})});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
