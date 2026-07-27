import { AppError } from './AppError';

export class ValidationError extends AppError {
  readonly statusCode = 400;
}
