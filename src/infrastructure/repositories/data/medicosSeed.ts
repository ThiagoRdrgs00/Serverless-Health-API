import { Medico } from '../../../domain/entities/Medico';

export const medicosSeed: Medico[] = [
  {
    id: 1,
    nome: 'Dr. João Silva',
    especialidade: 'Cardiologista',
    horarios: ['2026-06-10 09:00', '2026-06-10 10:00'],
  },
  {
    id: 2,
    nome: 'Dra. Maria Souza',
    especialidade: 'Dermatologista',
    horarios: ['2026-06-11 14:00', '2026-06-11 15:00'],
  },
];
