import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

type LambdaHandler = (
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;

export function withLogging(handler: LambdaHandler): LambdaHandler {
  return async (event) => {
    const inicio = Date.now();
    console.log(`[request] ${event.httpMethod} ${event.path}`);

    const result = await handler(event);

    console.log(
      `[response] ${event.httpMethod} ${event.path} -> ${result.statusCode} (${Date.now() - inicio}ms)`,
    );

    return result;
  };
}
