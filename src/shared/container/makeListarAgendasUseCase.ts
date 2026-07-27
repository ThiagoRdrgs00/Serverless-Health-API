import { ListarAgendasUseCase } from '../../application/useCases/listarAgendas/ListarAgendasUseCase';
import { agendamentoRepository, medicoRepository } from './repositories';

export function makeListarAgendasUseCase(): ListarAgendasUseCase {
  return new ListarAgendasUseCase(medicoRepository, agendamentoRepository);
}
