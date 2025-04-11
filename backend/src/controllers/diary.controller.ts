import { Request, Response } from 'express';
import Diary from '../models/diary.models';

export const getDiary = async (req: Request, res: Response) => {
  try {
    const entries = await Diary.find({ userId: (req as any).user.id }); // or use a proper custom Request type
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch diary entries' });
  }
};

export const addEntry = async (req: Request, res: Response) => {
  try {
    const newEntry = await Diary.create({
      ...req.body,
      userId: (req as any).user.id,
      date: new Date()
    });
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add diary entry' });
  }
};