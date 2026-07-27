import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IMedicoRepository } from '../../../domain/repositories/IMedicoRepository';
import { logExecution } from '../../../shared/decorators/logExecution';
import { ListarAgendasOutputDTO } from '../../dtos/AgendaOutputDTO';

export class ListarAgendasUseCase {
  constructor(
    private readonly medicoRepository: IMedicoRepository,
    private readonly agendamentoRepository: IAgendamentoRepository,
  ) {}

  @logExecution
  async execute(): Promise<ListarAgendasOutputDTO> {
    const medicos = await this.medicoRepository.findAll();
    const agendamentos = await this.agendamentoRepository.findAll();

    const medicosComHorariosDisponiveis = medicos.map((medico) => {
      const horariosDisponiveis = medico.horarios.filter(
        (horario) =>
          !agendamentos.some(
            (agendamento) =>
              agendamento.medicoId === medico.id &&
              agendamento.dataHorario === horario,
          ),
      );

      return {
        id: medico.id,
        nome: medico.nome,
        especialidade: medico.especialidade,
        horarios_disponiveis: horariosDisponiveis,
      };
    });

    return { medicos: medicosComHorariosDisponiveis };
  }
}
