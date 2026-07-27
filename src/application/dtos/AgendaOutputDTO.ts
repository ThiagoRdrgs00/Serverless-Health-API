export interface MedicoAgendaOutputDTO {
  id: number;
  nome: string;
  especialidade: string;
  horarios_disponiveis: string[];
}

export interface ListarAgendasOutputDTO {
  medicos: MedicoAgendaOutputDTO[];
}
