import { Agendamento } from '../../domain/entities/Agendamento';
import { IAgendamentoRepository } from '../../domain/repositories/IAgendamentoRepository';

export class InMemoryAgendamentoRepository implements IAgendamentoRepository {
  private readonly agendamentos: Agendamento[] = [];

  async findAll(): Promise<Agendamento[]> {
    return this.agendamentos;
  }

  async existsByMedicoIdAndDataHorario(
    medicoId: number,
    dataHorario: string,
  ): Promise<boolean> {
    return this.agendamentos.some(
      (agendamento) =>
        agendamento.medicoId === medicoId &&
        agendamento.dataHorario === dataHorario,
    );
  }

  async create(agendamento: Agendamento): Promise<Agendamento> {
    this.agendamentos.push(agendamento);
    return agendamento;
  }
}
