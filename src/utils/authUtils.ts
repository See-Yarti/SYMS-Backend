import jwt from 'jsonwebtoken';
import Locals from '@/providers/Locals';
import { Response } from 'express';

export function generateToken(data: { message: string }): string {
  return jwt.sign(data, Locals.config().JWT_SECRET, { expiresIn: '15s' });
}

export function handleAuthError(res: Response, message: string, redirectUrl?: string) {
  const token = generateToken({ message });
  return res.redirect(`${Locals.config().CLIENT_AUTH_ERROR_URL}?token=${token}`);
}
