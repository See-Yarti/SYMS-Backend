import { TUserSession } from '@/types/user.types';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: TUserSession | null;
    }
  }
}
