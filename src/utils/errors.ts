import { StatusCodes } from 'http-status-codes';

export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors?: any;
  constructor(success: boolean = false, message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(path: string) {
    super(false, `The requested resource ${path} not found!`, StatusCodes.NOT_FOUND);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, statusCode: number, errors?: any) {
    super(false, message, statusCode, errors);
  }
}

export class ApplicationError extends ApiError {
  constructor(message: string, errors?: any) {
    super(false, message, StatusCodes.BAD_REQUEST, errors);
  }
}
