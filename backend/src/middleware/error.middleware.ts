import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[ERROR]', err.stack);

  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
};