import { Request, Response, NextFunction } from 'express';
import successResponse from './SuccessResponse';
import { BadRequestError } from './errors';

export const asyncWrapper = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(req, res, next);
      if (result instanceof successResponse) {
        return res.status(result.statusCode).json(result);
      }
    } catch (error: unknown) {
      // console.error('AsyncWrapper Error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return next(new BadRequestError(errorMessage, statusCode));
    }
  };};
