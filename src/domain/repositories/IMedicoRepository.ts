import { Medico } from '../entities/Medico';

export interface IMedicoRepository {
  findAll(): Promise<Medico[]>;
  findById(id: number): Promise<Medico | undefined>;
}
