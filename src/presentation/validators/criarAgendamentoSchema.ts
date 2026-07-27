import { z } from 'zod';

export const criarAgendamentoSchema = z.object({
  agendamento: z.object({
    medico_id: z
      .number({ message: 'medico_id é obrigatório e deve ser um número.' })
      .int('medico_id deve ser um número inteiro.')
      .positive('medico_id deve ser um número positivo.'),
    paciente: z
      .string({ message: 'paciente é obrigatório e deve ser um texto.' })
      .trim()
      .min(1, 'paciente não pode ser vazio.'),
    data_horario: z
      .string({ message: 'data_horario é obrigatório e deve ser um texto.' })
      .regex(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
        'data_horario deve estar no formato "YYYY-MM-DD HH:mm".',
      ),
  }),
});

export type CriarAgendamentoRequestBody = z.infer<
  typeof criarAgendamentoSchema
>;
