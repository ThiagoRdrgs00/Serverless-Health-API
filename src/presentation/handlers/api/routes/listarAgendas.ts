import { APIGatewayProxyResult } from 'aws-lambda';
import { makeListarAgendasUseCase } from '../../../../shared/container/makeListarAgendasUseCase';
import { ok } from '../../../http/HttpResponse';

export async function listarAgendas(): Promise<APIGatewayProxyResult> {
  const listarAgendasUseCase = makeListarAgendasUseCase();
  const agendas = await listarAgendasUseCase.execute();

  return ok(agendas);
}
