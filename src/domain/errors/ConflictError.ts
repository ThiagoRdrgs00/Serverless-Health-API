import { AppError } from './AppError';

export class ConflictError extends AppError {
  readonly statusCode = 409;
}
