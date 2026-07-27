import { APIGatewayProxyResult } from 'aws-lambda';

function buildResponse(
  statusCode: number,
  body: unknown,
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function ok(body: unknown): APIGatewayProxyResult {
  return buildResponse(200, body);
}

export function created(body: unknown): APIGatewayProxyResult {
  return buildResponse(201, body);
}

export function errorResponse(
  statusCode: number,
  erro: string,
  mensagem: string,
): APIGatewayProxyResult {
  return buildResponse(statusCode, { erro, mensagem });
}

export function routeNotFound(): APIGatewayProxyResult {
  return errorResponse(
    404,
    'Rota não encontrada',
    'A rota solicitada não existe nesta API.',
  );
}
