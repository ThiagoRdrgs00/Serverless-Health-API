import { z } from 'zod';
import { ESPECIALIDADES_MEDICAS } from '../../domain/entities/Especialidade';

export const TriagemOutputSchema = z.object({
  especialidade: z.enum(ESPECIALIDADES_MEDICAS),
  justificativa: z
    .string()
    .describe('Explicação breve, em português, do motivo da sugestão.'),
});
