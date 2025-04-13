import { Router } from 'express';
import { getDiary, addEntry,addOcrEntry } from '../controllers/diary.controller';
import { verifyToken } from '../middleware/auth.middleware';
const router = Router();

//@route   GET /api/diary
//@desc    Get all diary entries for the logged-in user
//@access  Private (Requires JWT authentication) 
router.get('/', verifyToken, getDiary);

//@route   POST /api/diary
//@desc    Add a new diary entry for the logged-in user
//@access  Private (Requires JWT authentication)
router.post('/', verifyToken, addEntry);

router.post("/ocr", verifyToken, addOcrEntry);

export default router;