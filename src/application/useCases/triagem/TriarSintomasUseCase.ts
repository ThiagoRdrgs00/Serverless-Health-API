import { ITriagemService } from '../../../domain/services/ITriagemService';
import { logExecution } from '../../../shared/decorators/logExecution';
import { TriagemInputDTO, TriagemOutputDTO } from '../../dtos/TriagemDTO';

export class TriarSintomasUseCase {
  constructor(private readonly triagemService: ITriagemService) {}

  @logExecution
  async execute(input: TriagemInputDTO): Promise<TriagemOutputDTO> {
    const resultado = await this.triagemService.sugerirEspecialidade(
      input.sintomas,
    );

    return {
      especialidade_sugerida: resultado.especialidade,
      justificativa: resultado.justificativa,
    };
  }
}
