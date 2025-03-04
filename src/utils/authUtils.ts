import jwt from 'jsonwebtoken';
import Locals from '@/providers/Locals';
import { TUserSession } from '@/types/user.types';

type GenerateTokenProps = {
  payload: object;
  secret: string;
  options?: jwt.SignOptions;
};

/**
 * @param param {Object} parameters
 * @returns - Generated Token
 */
export function generateToken({ payload, options = {}, secret }: GenerateTokenProps): string {
  const finalOptions: jwt.SignOptions = {
    expiresIn: '15m',
    algorithm: 'HS256',
    ...options,
  };
  return jwt.sign(payload, secret, finalOptions);
}
/**
 * @param data - The data to be encoded into the token
 * @returns - The encoded token in a object
 */
export function generateAuthToken(data: TUserSession): { accessToken: string; refreshToken: string } {
  const accessToken = generateToken({
    payload: data,
    options: {
      expiresIn: '15m',
      subject: 'accessToken',
    },
    secret: Locals.config().ACCESS_TOKEN_SECRET,
  });
  const refreshToken = generateToken({
    payload: data,
    options: {
      expiresIn: '1d',
      subject: 'refreshToken',
    },
    secret: Locals.config().REFRESH_TOKEN_SECRET,
  });
  return {
    accessToken,
    refreshToken,
  };
}
/** 
 @param token - The token to verify against
 @param type - The type of token to verify
 @returns The decoded payload if the token is valid, otherwise throws an error
 @throws jwt.JsonWebTokenError if the token is invalid
 @throws jwt.TokenExpiredError if the token has expired
 @throws jwt.NotBeforeError if the token is not valid yet
 @throws jwt.InvalidTokenError if the token is malformed or tampered with
*/
export function verifyToken(token: string, type: 'accessToken' | 'refreshToken'): string | jwt.JwtPayload {
  const secret = type === 'accessToken' ? Locals.config().ACCESS_TOKEN_SECRET : Locals.config().REFRESH_TOKEN_SECRET;
  return jwt.verify(token, secret);
}

/**
 *
 * @param expiration - The expiration time of the token in the format "1d" or "1h" or "1m" or "1s"
 * @returns
 */
export function convertExpirationToMS(expiration: string): number {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid Expiration Format');

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const unitToMs: { [key: string]: number } = {
    s: 1000, // Seconds
    m: 60 * 1000, // Minutes
    h: 60 * 60 * 1000, // Hours
    d: 24 * 60 * 60 * 1000, // Days
  };

  return value * unitToMs[unit];
}
