import { StatusCodes } from 'http-status-codes';

export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  constructor(success: boolean = false, message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(path: string) {
    super(false, `The requested resource ${path} not found!`, StatusCodes.NOT_FOUND);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, statusCode: number) {
    super(false, message, statusCode);
  }
}

export class ApplicationError extends ApiError {
  constructor(message: string, errors?: string[]) {
    super(false, message, StatusCodes.BAD_REQUEST);
  }
}
