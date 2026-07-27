import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleError } from '../../http/handleError';
import { routeNotFound } from '../../http/HttpResponse';
import { criarAgendamento } from './routes/criarAgendamento';
import { listarAgendas } from './routes/listarAgendas';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path } = event;

    if (httpMethod === 'GET' && path === '/agendas') {
      return await listarAgendas();
    }

    if (httpMethod === 'POST' && path === '/agendamento') {
      return await criarAgendamento(event);
    }

    return routeNotFound();
  } catch (error) {
    return handleError(error);
  }
};
