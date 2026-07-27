import { AppError } from './AppError';

export class NotFoundError extends AppError {
  readonly statusCode = 404;
}
