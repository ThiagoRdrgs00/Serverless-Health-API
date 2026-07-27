import { Agendamento } from '../../../domain/entities/Agendamento';
import { Medico } from '../../../domain/entities/Medico';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IMedicoRepository } from '../../../domain/repositories/IMedicoRepository';
import { ListarAgendasUseCase } from './ListarAgendasUseCase';

function makeMedicoRepository(medicos: Medico[]): IMedicoRepository {
  return {
    findAll: jest.fn().mockResolvedValue(medicos),
    findById: jest.fn(),
  };
}

function makeAgendamentoRepository(
  agendamentos: Agendamento[],
): IAgendamentoRepository {
  return {
    findAll: jest.fn().mockResolvedValue(agendamentos),
    existsByMedicoIdAndDataHorario: jest.fn(),
    create: jest.fn(),
  };
}

describe('ListarAgendasUseCase', () => {
  const medico1: Medico = {
    id: 1,
    nome: 'Dr. João Silva',
    especialidade: 'Cardiologista',
    horarios: ['2026-06-10 09:00', '2026-06-10 10:00'],
  };

  const medico2: Medico = {
    id: 2,
    nome: 'Dra. Maria Souza',
    especialidade: 'Dermatologista',
    horarios: ['2026-06-11 14:00'],
  };

  it('lista todos os horarios de todos os medicos quando nao ha agendamentos', async () => {
    const medicoRepository = makeMedicoRepository([medico1, medico2]);
    const agendamentoRepository = makeAgendamentoRepository([]);
    const sut = new ListarAgendasUseCase(
      medicoRepository,
      agendamentoRepository,
    );

    const result = await sut.execute();

    expect(result.medicos).toEqual([
      {
        id: 1,
        nome: 'Dr. João Silva',
        especialidade: 'Cardiologista',
        horarios_disponiveis: ['2026-06-10 09:00', '2026-06-10 10:00'],
      },
      {
        id: 2,
        nome: 'Dra. Maria Souza',
        especialidade: 'Dermatologista',
        horarios_disponiveis: ['2026-06-11 14:00'],
      },
    ]);
  });

  it('remove da listagem o horario que ja possui agendamento', async () => {
    const medicoRepository = makeMedicoRepository([medico1]);
    const agendamento: Agendamento = {
      id: 'uuid-1',
      medicoId: 1,
      medicoNome: 'Dr. João Silva',
      paciente: 'Carlos Almeida',
      dataHorario: '2026-06-10 09:00',
    };
    const agendamentoRepository = makeAgendamentoRepository([agendamento]);
    const sut = new ListarAgendasUseCase(
      medicoRepository,
      agendamentoRepository,
    );

    const result = await sut.execute();

    expect(result.medicos[0].horarios_disponiveis).toEqual([
      '2026-06-10 10:00',
    ]);
  });

  it('nao afeta a disponibilidade de um medico diferente do agendado', async () => {
    const medicoRepository = makeMedicoRepository([medico1, medico2]);
    const agendamento: Agendamento = {
      id: 'uuid-1',
      medicoId: 2,
      medicoNome: 'Dra. Maria Souza',
      paciente: 'Carlos Almeida',
      dataHorario: '2026-06-11 14:00',
    };
    const agendamentoRepository = makeAgendamentoRepository([agendamento]);
    const sut = new ListarAgendasUseCase(
      medicoRepository,
      agendamentoRepository,
    );

    const result = await sut.execute();

    expect(result.medicos[0].horarios_disponiveis).toEqual(medico1.horarios);
    expect(result.medicos[1].horarios_disponiveis).toEqual([]);
  });
});
