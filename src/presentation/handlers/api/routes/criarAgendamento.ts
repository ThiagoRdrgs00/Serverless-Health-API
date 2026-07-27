import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CriarAgendamentoInputDTO } from '../../../../application/dtos/CriarAgendamentoDTO';
import { ValidationError } from '../../../../domain/errors/ValidationError';
import { makeCriarAgendamentoUseCase } from '../../../../shared/container/makeCriarAgendamentoUseCase';
import { created } from '../../../http/HttpResponse';
import { parseBody } from '../../../http/parseBody';
import { criarAgendamentoSchema } from '../../../validators/criarAgendamentoSchema';
import { formatZodError } from '../../../validators/formatZodError';

export async function criarAgendamento(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const rawBody = parseBody(event.body);
  const parsedBody = criarAgendamentoSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    throw new ValidationError(
      'Payload inválido',
      formatZodError(parsedBody.error),
    );
  }

  const { agendamento } = parsedBody.data;

  const input: CriarAgendamentoInputDTO = {
    medicoId: agendamento.medico_id,
    paciente: agendamento.paciente,
    dataHorario: agendamento.data_horario,
  };

  const criarAgendamentoUseCase = makeCriarAgendamentoUseCase();
  const agendamentoCriado = await criarAgendamentoUseCase.execute(input);

  return created({
    mensagem: 'Agendamento realizado com sucesso',
    agendamento: agendamentoCriado,
  });
}
