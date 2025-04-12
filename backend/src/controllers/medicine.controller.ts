import { Request, Response } from 'express';
import { runOCR } from '../services/ocr.service';
import{ Medicine }from '../models/medicine.models';
import { GenericMed } from '../models/medicine.models'; // you saved both in same file
import mongoose from 'mongoose';

const normalizeText = (text: string): { clean: string; ingredients: Record<string, number> } => {
  if (!text) return { clean: '', ingredients: {} };

  text = text.toLowerCase().trim();

  const stopWords = ['ip', 'tablet', 'tablets', 'capsule', 'capsules', 'oral', 'solution', 'injection', 'syrup'];
  stopWords.forEach(word => {
    text = text.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });

  let clean = text.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ').trim();

  const ingredients: Record<string, number> = {};
  const matches = clean.matchAll(/([a-z]+)\s*(\d+\.?\d*)\s*(mg|ml|g|mcg)?/g);

  for (const match of matches) {
    const name = match[1];
    let dose = parseFloat(match[2]);
    const unit = match[3] || 'mg';

    if (unit === 'g') dose *= 1000;
    if (unit === 'mcg') dose /= 1000;

    ingredients[name] = dose;
  }

  return { clean, ingredients };
};

const computeSimilarity = (branded: string, generic: string): number => {
  const { clean: cleanA, ingredients: ingA } = normalizeText(branded);
  const { clean: cleanB, ingredients: ingB } = normalizeText(generic);

  const wordsA = new Set(cleanA.split(' ').filter(w => !/^\d+$/.test(w)));
  const wordsB = new Set(cleanB.split(' ').filter(w => !/^\d+$/.test(w)));
  const wordUnion = new Set([...wordsA, ...wordsB]);
  const wordIntersection = new Set([...wordsA].filter(w => wordsB.has(w)));

  const nameSimilarity = wordUnion.size > 0 ? wordIntersection.size / wordUnion.size : 0;

  const ingKeys = new Set([...Object.keys(ingA), ...Object.keys(ingB)]);
  const commonKeys = new Set([...Object.keys(ingA)].filter(k => k in ingB));

  let ingSim = 0;
  if (commonKeys.size > 0) {
    const ingMatchScore = commonKeys.size / ingKeys.size;

    let dosageScore = 0;
    for (const key of commonKeys) {
      const doseA = ingA[key];
      const doseB = ingB[key];
      const relDiff = Math.abs(doseA - doseB) / Math.max(doseA, doseB);
      dosageScore += 1 - Math.min(relDiff, 1);
    }
    dosageScore /= commonKeys.size;

    ingSim = 0.7 * ingMatchScore + 0.3 * dosageScore;
  }

  return ingSim > 0 ? 0.3 * nameSimilarity + 0.7 * ingSim : nameSimilarity;
};


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

    const branded = await Medicine.findOne({
      name: { $regex: name, $options: 'i' }
    });

    if (!branded) {
      return res.status(404).json({ message: 'No medicine found matching the query.' });
    }

    const saltText = (branded.salt_composition || '').replace(/\+|\(|\)/g, ' ');

    const generics = await GenericMed.find({});
    let bestGeneric = null;
    let highestScore = 0;

    for (const generic of generics) {
      const genName = generic.generic_name;
      if (!genName) continue;

      const sim = computeSimilarity(saltText, genName);
      generic.similarity_score = sim;

      if (sim > highestScore) {
        highestScore = sim;
        bestGeneric = generic;
      }
    }

    const threshold = 0.5;
    const result = {
      ...branded.toObject(),
      generic_name: bestGeneric?.generic_name || null,
      unit_size: bestGeneric?.unit_size || null,
      mrp: bestGeneric?.mrp || null,
      similarity_score: bestGeneric?.similarity_score || 0
    };

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