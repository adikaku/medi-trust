import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as Secret;

export const generateToken = (
  payload: string | object | Buffer,
  options: SignOptions = { expiresIn: '7d' }
): string => {
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};