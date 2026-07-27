import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { ExternalServiceError } from '../../domain/errors/ExternalServiceError';
import {
  ITriagemService,
  TriagemResultado,
} from '../../domain/services/ITriagemService';
import { buildTriagemSystemPrompt } from './buildTriagemSystemPrompt';
import { TriagemOutputSchema } from './TriagemOutputSchema';

const MODELO = 'claude-haiku-4-5';

export class AnthropicTriagemService implements ITriagemService {
  private client: Anthropic | undefined;

  // Criado sob demanda, na primeira chamada real - instanciar o Anthropic
  // SDK dispara resolucao assincrona de credenciais, que nao deve acontecer
  // so por importar o modulo (ex.: em testes, ou em invocacoes de outras
  // rotas que nunca usam IA).
  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic();
    }

    return this.client;
  }

  async sugerirEspecialidade(sintomas: string): Promise<TriagemResultado> {
    try {
      const response = await this.getClient().messages.parse({
        model: MODELO,
        max_tokens: 1024,
        system: buildTriagemSystemPrompt(),
        messages: [{ role: 'user', content: sintomas }],
        output_config: {
          format: zodOutputFormat(TriagemOutputSchema),
        },
      });

      if (response.stop_reason === 'refusal') {
        throw new ExternalServiceError(
          'Triagem indisponível',
          'O modelo de IA recusou processar esta solicitação.',
        );
      }

      if (!response.parsed_output) {
        throw new ExternalServiceError(
          'Triagem indisponível',
          'O modelo de IA não retornou uma resposta no formato esperado.',
        );
      }

      return response.parsed_output;
    } catch (error) {
      throw this.paraErroExterno(error);
    }
  }

  private paraErroExterno(error: unknown): ExternalServiceError {
    if (error instanceof ExternalServiceError) {
      return error;
    }

    if (error instanceof Anthropic.APIError) {
      console.error(
        `[AnthropicTriagemService] erro da API Anthropic (status ${error.status}): ${error.message}`,
      );
    } else {
      console.error('[AnthropicTriagemService] erro inesperado:', error);
    }

    if (error instanceof Anthropic.AuthenticationError) {
      return new ExternalServiceError(
        'Triagem indisponível',
        'Falha de autenticação com o serviço de IA (chave de API ausente ou inválida).',
      );
    }

    if (error instanceof Anthropic.RateLimitError) {
      return new ExternalServiceError(
        'Triagem indisponível',
        'O serviço de IA está temporariamente sobrecarregado. Tente novamente em instantes.',
      );
    }

    if (error instanceof Anthropic.APIConnectionError) {
      return new ExternalServiceError(
        'Triagem indisponível',
        'Não foi possível conectar ao serviço de IA.',
      );
    }

    if (error instanceof Anthropic.APIError) {
      return new ExternalServiceError(
        'Triagem indisponível',
        `O serviço de IA retornou um erro inesperado (status ${error.status}).`,
      );
    }

    return new ExternalServiceError(
      'Triagem indisponível',
      'Erro inesperado ao consultar o serviço de IA.',
    );
  }
}
