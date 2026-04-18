import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public readonly statusCode: StatusCodes;
  // Operational errors are expected (invalid input, not found, etc.).
  // Non-operational (isOperational = false) are programmer bugs — don't leak details.
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
