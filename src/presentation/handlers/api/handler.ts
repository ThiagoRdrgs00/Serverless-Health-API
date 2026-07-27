import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { routeNotFound } from '../../http/HttpResponse';
import { withErrorHandling } from '../../http/withErrorHandling';
import { withLogging } from '../../http/withLogging';
import { criarAgendamento } from './routes/criarAgendamento';
import { listarAgendas } from './routes/listarAgendas';

async function router(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const { httpMethod, path } = event;

  if (httpMethod === 'GET' && path === '/agendas') {
    return listarAgendas();
  }

  if (httpMethod === 'POST' && path === '/agendamento') {
    return criarAgendamento(event);
  }

  return routeNotFound();
}

export const handler = withLogging(withErrorHandling(router));
