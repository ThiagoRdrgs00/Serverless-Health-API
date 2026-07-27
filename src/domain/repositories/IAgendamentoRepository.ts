import { Agendamento } from '../entities/Agendamento';

export interface IAgendamentoRepository {
  findAll(): Promise<Agendamento[]>;
  existsByMedicoIdAndDataHorario(
    medicoId: number,
    dataHorario: string,
  ): Promise<boolean>;
  create(agendamento: Agendamento): Promise<Agendamento>;
}
