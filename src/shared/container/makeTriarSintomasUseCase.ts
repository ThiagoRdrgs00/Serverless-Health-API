import { TriarSintomasUseCase } from '../../application/useCases/triagem/TriarSintomasUseCase';
import { triagemService } from './services';

export function makeTriarSintomasUseCase(): TriarSintomasUseCase {
  return new TriarSintomasUseCase(triagemService);
}
