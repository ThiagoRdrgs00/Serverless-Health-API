import {
  ITriagemService,
  TriagemResultado,
} from '../../../domain/services/ITriagemService';
import { TriarSintomasUseCase } from './TriarSintomasUseCase';

function makeTriagemService(resultado: TriagemResultado): ITriagemService {
  return {
    sugerirEspecialidade: jest.fn().mockResolvedValue(resultado),
  };
}

describe('TriarSintomasUseCase', () => {
  it('retorna a especialidade sugerida e a justificativa', async () => {
    const triagemService = makeTriagemService({
      especialidade: 'Cardiologista',
      justificativa:
        'Dor no peito e falta de ar sugerem avaliação cardiológica.',
    });
    const sut = new TriarSintomasUseCase(triagemService);

    const result = await sut.execute({
      sintomas: 'Dor no peito e falta de ar',
    });

    expect(result).toEqual({
      especialidade_sugerida: 'Cardiologista',
      justificativa:
        'Dor no peito e falta de ar sugerem avaliação cardiológica.',
    });
    expect(triagemService.sugerirEspecialidade).toHaveBeenCalledWith(
      'Dor no peito e falta de ar',
    );
  });

  it('propaga o erro lançado pelo serviço de triagem', async () => {
    const triagemService: ITriagemService = {
      sugerirEspecialidade: jest.fn().mockRejectedValue(new Error('falha')),
    };
    const sut = new TriarSintomasUseCase(triagemService);

    await expect(
      sut.execute({ sintomas: 'sintomas quaisquer' }),
    ).rejects.toThrow('falha');
  });
});
