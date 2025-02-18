import jwt from 'jsonwebtoken';
import Locals from '@/providers/Locals';
import { Response } from 'express';

type GenerateTokenProps = {
  payload: object;
  options?: jwt.SignOptions;
};

const defaultOptions: jwt.SignOptions = {
  expiresIn: '15m',
  algorithm: 'HS256',
  subject: 'otpVerifyToken',
};

export function generateToken({ payload, options = {} }: GenerateTokenProps): string {
  const finalOptions = { ...defaultOptions, ...options }; 
  return jwt.sign(payload, Locals.config().JWT_SECRET, finalOptions);
}

export function verifyToken(token: string): string | jwt.JwtPayload {
  return jwt.verify(token, Locals.config().JWT_SECRET);
}

export function handleAuthError(res: Response, message: string, redirectUrl?: string) {
  const token = generateToken({
    payload: { message },
    options: {
      expiresIn: '5s',
      subject: 'authErrorToken',
    }
  });
  return res.redirect(`${Locals.config().CLIENT_AUTH_ERROR_URL}?token=${token}`);
}
