import { Agendamento } from '../../../domain/entities/Agendamento';
import { Medico } from '../../../domain/entities/Medico';
import { ConflictError } from '../../../domain/errors/ConflictError';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IMedicoRepository } from '../../../domain/repositories/IMedicoRepository';
import { CriarAgendamentoUseCase } from './CriarAgendamentoUseCase';

const medico: Medico = {
  id: 1,
  nome: 'Dr. João Silva',
  especialidade: 'Cardiologista',
  horarios: ['2026-06-10 09:00', '2026-06-10 10:00'],
};

function makeMedicoRepository(
  medicoEncontrado: Medico | undefined,
): IMedicoRepository {
  return {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(medicoEncontrado),
  };
}

function makeAgendamentoRepository(
  horarioOcupado: boolean,
): IAgendamentoRepository {
  return {
    findAll: jest.fn(),
    existsByMedicoIdAndDataHorario: jest.fn().mockResolvedValue(horarioOcupado),
    create: jest
      .fn()
      .mockImplementation((agendamento: Agendamento) =>
        Promise.resolve(agendamento),
      ),
  };
}

describe('CriarAgendamentoUseCase', () => {
  it('cria um agendamento quando o medico existe e o horario esta disponivel', async () => {
    const medicoRepository = makeMedicoRepository(medico);
    const agendamentoRepository = makeAgendamentoRepository(false);
    const sut = new CriarAgendamentoUseCase(
      medicoRepository,
      agendamentoRepository,
    );

    const result = await sut.execute({
      medicoId: 1,
      paciente: 'Carlos Almeida',
      dataHorario: '2026-06-10 09:00',
    });

    expect(result).toEqual({
      id: expect.any(String),
      medico: 'Dr. João Silva',
      paciente: 'Carlos Almeida',
      data_horario: '2026-06-10 09:00',
    });
    expect(agendamentoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        medicoId: 1,
        medicoNome: 'Dr. João Silva',
        paciente: 'Carlos Almeida',
        dataHorario: '2026-06-10 09:00',
      }),
    );
  });

  it('lanca NotFoundError quando o medico nao existe', async () => {
    const medicoRepository = makeMedicoRepository(undefined);
    const agendamentoRepository = makeAgendamentoRepository(false);
    const sut = new CriarAgendamentoUseCase(
      medicoRepository,
      agendamentoRepository,
    );

    await expect(
      sut.execute({
        medicoId: 999,
        paciente: 'Carlos Almeida',
        dataHorario: '2026-06-10 09:00',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanca ValidationError quando o horario nao pertence a agenda do medico', async () => {
    const medicoRepository = makeMedicoRepository(medico);
    const agendamentoRepository = makeAgendamentoRepository(false);
    const sut = new CriarAgendamentoUseCase(
      medicoRepository,
      agendamentoRepository,
    );

    await expect(
      sut.execute({
        medicoId: 1,
        paciente: 'Carlos Almeida',
        dataHorario: '2026-06-10 23:59',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanca ConflictError quando o horario ja esta ocupado', async () => {
    const medicoRepository = makeMedicoRepository(medico);
    const agendamentoRepository = makeAgendamentoRepository(true);
    const sut = new CriarAgendamentoUseCase(
      medicoRepository,
      agendamentoRepository,
    );

    await expect(
      sut.execute({
        medicoId: 1,
        paciente: 'Carlos Almeida',
        dataHorario: '2026-06-10 09:00',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
