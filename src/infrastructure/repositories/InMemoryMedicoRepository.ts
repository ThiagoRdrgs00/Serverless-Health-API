import { Medico } from '../../domain/entities/Medico';
import { IMedicoRepository } from '../../domain/repositories/IMedicoRepository';
import { medicosSeed } from './data/medicosSeed';

export class InMemoryMedicoRepository implements IMedicoRepository {
  private readonly medicos: Medico[] = medicosSeed;

  async findAll(): Promise<Medico[]> {
    return this.medicos;
  }

  async findById(id: number): Promise<Medico | undefined> {
    return this.medicos.find((medico) => medico.id === id);
  }
}
