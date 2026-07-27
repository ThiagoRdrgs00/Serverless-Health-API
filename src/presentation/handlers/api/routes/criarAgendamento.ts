import { APIGatewayProxyResult } from 'aws-lambda';
import { CriarAgendamentoInputDTO } from '../../../../application/dtos/CriarAgendamentoDTO';
import { makeCriarAgendamentoUseCase } from '../../../../shared/container/makeCriarAgendamentoUseCase';
import { created } from '../../../http/HttpResponse';
import { withValidation } from '../../../http/withValidation';
import { criarAgendamentoSchema } from '../../../validators/criarAgendamentoSchema';

export const criarAgendamento = withValidation(
  criarAgendamentoSchema,
  async (body): Promise<APIGatewayProxyResult> => {
    const { agendamento } = body;

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
  },
);
