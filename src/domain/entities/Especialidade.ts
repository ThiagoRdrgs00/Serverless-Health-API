export const ESPECIALIDADES_MEDICAS = [
  'Clínico Geral',
  'Cardiologista',
  'Dermatologista',
  'Ortopedista',
  'Pediatra',
  'Neurologista',
  'Psiquiatra',
  'Ginecologista',
  'Otorrinolaringologista',
  'Oftalmologista',
  'Gastroenterologista',
  'Urologista',
] as const;

export type Especialidade = (typeof ESPECIALIDADES_MEDICAS)[number];
