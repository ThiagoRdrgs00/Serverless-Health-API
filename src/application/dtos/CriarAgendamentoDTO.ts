export interface CriarAgendamentoInputDTO {
  medicoId: number;
  paciente: string;
  dataHorario: string;
}

export interface CriarAgendamentoOutputDTO {
  id: string;
  medico: string;
  paciente: string;
  data_horario: string;
}
