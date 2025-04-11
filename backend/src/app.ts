import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import medicineRoutes from './routes/medicine.routes';
import diaryRoutes from './routes/diary.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/diary', diaryRoutes);

app.use(errorHandler);
export default app;