import { z } from 'zod';

export const triagemSchema = z.object({
  sintomas: z
    .string({ message: 'sintomas é obrigatório e deve ser um texto.' })
    .trim()
    .min(10, 'sintomas deve ter pelo menos 10 caracteres.')
    .max(1000, 'sintomas deve ter no máximo 1000 caracteres.'),
});
