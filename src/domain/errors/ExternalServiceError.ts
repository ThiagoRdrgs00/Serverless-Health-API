import { AppError } from './AppError';

export class ExternalServiceError extends AppError {
  readonly statusCode = 502;
}
