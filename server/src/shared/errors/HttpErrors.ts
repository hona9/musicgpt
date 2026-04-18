import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, StatusCodes.CONFLICT);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity") {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    // Programmer-level — not operational
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, false);
  }
}
