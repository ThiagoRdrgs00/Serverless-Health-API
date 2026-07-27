import { Especialidade } from '../entities/Especialidade';

export interface TriagemResultado {
  especialidade: Especialidade;
  justificativa: string;
}

export interface ITriagemService {
  sugerirEspecialidade(sintomas: string): Promise<TriagemResultado>;
}
