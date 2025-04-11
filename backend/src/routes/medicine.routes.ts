import { Router } from 'express';
import multer from 'multer';
import { uploadOCRImage, searchMedicine, getAllMedicines } from '../controllers/medicine.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// GET: Search medicine by query
router.get('/search', searchMedicine);

// POST: OCR image upload
router.post('/ocr/upload', upload.single('image'), uploadOCRImage);

// ✅ NEW: GET all medicines
router.get('/all', getAllMedicines);

export default router;