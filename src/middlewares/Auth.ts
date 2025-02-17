import { NextFunction, Request, Response } from 'express';

class AuthMiddleware {
  static validateCallbackUrl(request: Request, response: Response, next: NextFunction) {
    const callbackUrl = request.query.redirectTo as string;
    request.redirectTo = typeof callbackUrl === 'string' ? callbackUrl : undefined;
    next();
  }
}

export default AuthMiddleware;
