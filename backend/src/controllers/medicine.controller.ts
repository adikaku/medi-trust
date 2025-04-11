import { Request, Response } from 'express';
import { runOCR } from '../services/ocr.service';
import Medicine from '../models/medicine.models';

/**
 * Get all medicines
 * Endpoint: GET /api/medicine/all
 */
export const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    console.error('[getAllMedicines Error]', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
};

/**
 * Search medicine by name using a regex match (case-insensitive)
 * Endpoint: GET /api/medicine/search?name=<query>
 */
export const searchMedicine = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Query parameter "name" is required.' });
    }

    const result = await Medicine.findOne({
      name: { $regex: name, $options: 'i' }
    });

    if (!result) {
      return res.status(404).json({ message: 'No medicine found matching the query.' });
    }

    res.json(result);
  } catch (error) {
    console.error('[searchMedicine Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * OCR Image Upload + Analysis
 * Endpoint: POST /api/medicine/ocr/upload
 */
export const uploadOCRImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    console.log('[INFO] OCR file received:', file.filename);
    
    // 🔥 Run the OCR using just the filename
    const result = await runOCR(file.filename);
    
    // Add print statement here after receiving the result
    console.log('[INFO] OCR result received:');
    console.log(JSON.stringify(result, null, 2)); // Pretty print the result
    
    if (!result || Object.keys(result).length === 0) {
      return res.status(404).json({ error: 'No matching medicine found from OCR.' });
    }
    
    return res.status(200).json(result);
  } catch (err) {
    console.error('[uploadOCRImage Error]', err);
    return res.status(500).json({ error: 'OCR processing failed' });
  }
};