import { APIGatewayProxyResult } from 'aws-lambda';
import { makeTriarSintomasUseCase } from '../../../../shared/container/makeTriarSintomasUseCase';
import { ok } from '../../../http/HttpResponse';
import { withValidation } from '../../../http/withValidation';
import { triagemSchema } from '../../../validators/triagemSchema';

export const triagem = withValidation(
  triagemSchema,
  async (body): Promise<APIGatewayProxyResult> => {
    const triarSintomasUseCase = makeTriarSintomasUseCase();
    const resultado = await triarSintomasUseCase.execute({
      sintomas: body.sintomas,
    });

    return ok(resultado);
  },
);
