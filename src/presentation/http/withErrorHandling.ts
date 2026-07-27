import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleError } from './handleError';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;

export function withErrorHandling(handler: LambdaHandler): LambdaHandler {
  return async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      return handleError(error);
    }
  };
}
