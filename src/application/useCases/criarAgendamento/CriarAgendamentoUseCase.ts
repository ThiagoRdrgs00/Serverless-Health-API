import { randomUUID } from 'node:crypto';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IMedicoRepository } from '../../../domain/repositories/IMedicoRepository';
import { logExecution } from '../../../shared/decorators/logExecution';
import {
  CriarAgendamentoInputDTO,
  CriarAgendamentoOutputDTO,
} from '../../dtos/CriarAgendamentoDTO';

export class CriarAgendamentoUseCase {
  constructor(
    private readonly medicoRepository: IMedicoRepository,
    private readonly agendamentoRepository: IAgendamentoRepository,
  ) {}

  @logExecution
  async execute(
    input: CriarAgendamentoInputDTO,
  ): Promise<CriarAgendamentoOutputDTO> {
    const medico = await this.medicoRepository.findById(input.medicoId);

    if (!medico) {
      throw new NotFoundError(
        'Médico não encontrado',
        `Médico com id ${input.medicoId} não encontrado.`,
      );
    }

    if (!medico.horarios.includes(input.dataHorario)) {
      throw new ValidationError(
        'Horário inválido',
        'O horário informado não faz parte da agenda deste médico.',
      );
    }

    const horarioOcupado =
      await this.agendamentoRepository.existsByMedicoIdAndDataHorario(
        input.medicoId,
        input.dataHorario,
      );

    if (horarioOcupado) {
      throw new ConflictError(
        'Horário indisponível',
        'O horário solicitado não está mais disponível para este médico.',
      );
    }

    const agendamento = await this.agendamentoRepository.create({
      id: randomUUID(),
      medicoId: medico.id,
      medicoNome: medico.nome,
      paciente: input.paciente,
      dataHorario: input.dataHorario,
    });

    return {
      id: agendamento.id,
      medico: agendamento.medicoNome,
      paciente: agendamento.paciente,
      data_horario: agendamento.dataHorario,
    };
  }
}
