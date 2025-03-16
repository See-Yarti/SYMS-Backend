import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestError } from '@/utils/errors';
import { verifyToken } from '@/utils/authUtils';
import User from '@/models/user.model';
import { TUserSession, UserRole } from '@/types/user.types';
import { asyncWrapper } from '@/utils/asyncWrapper';

type inputValidatorProps<T extends object> = {
  dto: ClassConstructor<T>;
  target: 'body' | 'params' | 'query';
};

class Validator {
  // Validate the request body against the DTO object
  public inputValidator<T extends object>(props: inputValidatorProps<T>): RequestHandler {
    return asyncWrapper(async (request: Request, response: Response, next: NextFunction) => {
      let rawData = request[props.target];

      if (request.is('multipart/form-data') && request.body.data) {
        try {
          rawData = JSON.parse(request.body.data);
        } catch (error) {
          throw new BadRequestError('Invalid JSON in form-data', 400);
        }
      }

      // Convert raw data into DTO instance
      const dtoObject = plainToInstance(props.dto, rawData);
      console.log(dtoObject);
      if (!dtoObject) throw new BadRequestError('Invalid Request - Please Try Again With Correct Parameters', 400);

      // Validate the DTO fields
      const errors = await validate(dtoObject);
      if (errors.length > 0) {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }));

        throw new BadRequestError('Invalid Request - Please Try Again With Correct Parameters', 400, formattedErrors);
      }

      // Assign validated data back to request
      if (props.target === 'query' || props.target === 'params') {
        Object.defineProperty(request, props.target, {
          value: dtoObject,
          writable: true,
          configurable: true,
        });
      } else {
        request[props.target] = dtoObject;
      }

      // Move to the next middleware
      next();
    });
  }
  /**
   * @param options - Configuration object for token validation
   * @param options.acceptRoles - Array of roles that are allowed to access
   * @param options.rejectRoles - Array of roles that are not allowed to access
   * @returns if the token is valid next() will be called otherwise throw an bad request error
   */
  public tokenValidator(options?: { acceptRoles?: UserRole[]; rejectRoles?: UserRole[] }): RequestHandler {
    return asyncWrapper(async (request: Request, response: Response, next: NextFunction) => {
      const authHeader = request.headers.authorization;
      if (!authHeader) throw new BadRequestError('Unauthorized Request', 401);
      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = verifyToken(token, 'accessToken') as TUserSession;
        // Check if the token is valid
        if (!decoded) throw new BadRequestError('Unauthorized Request', 401);
      } catch (error) {
        throw new BadRequestError('Unauthorized Request', 401, error);
      }

      // If acceptRoles is specified, check if user's role is included
      if (options?.acceptRoles && options.acceptRoles.length > 0) {
        if (!options.acceptRoles.includes(decoded?.role as UserRole)) {
          throw new BadRequestError('Unauthorized Access - Role not permitted', 401);
        }
      }

      // If rejectRoles is specified, check if user's role is not included
      if (options?.rejectRoles && options.rejectRoles.length > 0) {
        if (options.rejectRoles.includes(decoded?.role as UserRole)) {
          throw new BadRequestError('Unauthorized Access - Role restricted', 401);
        }
      }

      // Get the user from the database
      const user = await User.findOne({ email: decoded?.email }).exec();
      if (!user) throw new BadRequestError('Unauthorized User', 401);

      // Add the user to the request object
      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      } as TUserSession;
      next();
    });
  }
}
export default Validator;
