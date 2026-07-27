import { InMemoryAgendamentoRepository } from '../../infrastructure/repositories/InMemoryAgendamentoRepository';
import { InMemoryMedicoRepository } from '../../infrastructure/repositories/InMemoryMedicoRepository';

export const medicoRepository = new InMemoryMedicoRepository();
export const agendamentoRepository = new InMemoryAgendamentoRepository();
