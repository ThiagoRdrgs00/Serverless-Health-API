import { CriarAgendamentoUseCase } from '../../application/useCases/criarAgendamento/CriarAgendamentoUseCase';
import { agendamentoRepository, medicoRepository } from './repositories';

export function makeCriarAgendamentoUseCase(): CriarAgendamentoUseCase {
  return new CriarAgendamentoUseCase(medicoRepository, agendamentoRepository);
}
