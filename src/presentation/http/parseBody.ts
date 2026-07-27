import { ValidationError } from '../../domain/errors/ValidationError';

export function parseBody(body: string | null): unknown {
  if (!body) {
    throw new ValidationError('Payload inválido', 'Corpo da requisição vazio.');
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new ValidationError(
      'Payload inválido',
      'Corpo da requisição não é um JSON válido.',
    );
  }
}
