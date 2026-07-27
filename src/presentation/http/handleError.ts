import { APIGatewayProxyResult } from 'aws-lambda';
import { AppError } from '../../domain/errors/AppError';
import { errorResponse } from './HttpResponse';

export function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof AppError) {
    return errorResponse(error.statusCode, error.erro, error.message);
  }

  console.error('Erro inesperado:', error);

  return errorResponse(
    500,
    'Erro interno',
    'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  );
}
