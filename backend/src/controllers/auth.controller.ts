import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const login = (req: Request, res: Response): void => {
  const { email } = req.body;

  const token = jwt.sign(
    { id: email },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({ token });
};