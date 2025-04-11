import { Router } from 'express';
import { getDiary, addEntry } from '../controllers/diary.controller';
import { verifyToken } from '../middleware/auth.middleware';
const router = Router();
router.get('/', verifyToken, getDiary);
router.post('/', verifyToken, addEntry);
export default router;