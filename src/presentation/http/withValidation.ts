import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ZodType } from 'zod';
import { ValidationError } from '../../domain/errors/ValidationError';
import { formatZodError } from '../validators/formatZodError';
import { parseBody } from './parseBody';

type ValidatedRouteHandler<T> = (
  data: T,
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;

export function withValidation<T>(
  schema: ZodType<T>,
  handler: ValidatedRouteHandler<T>,
): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> {
  return async (event) => {
    const rawBody = parseBody(event.body);
    const parsedBody = schema.safeParse(rawBody);

    if (!parsedBody.success) {
      throw new ValidationError(
        'Payload inválido',
        formatZodError(parsedBody.error),
      );
    }

    return handler(parsedBody.data, event);
  };
}
