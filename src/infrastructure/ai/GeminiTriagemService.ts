import { GoogleGenAI } from '@google/genai';
import { ESPECIALIDADES_MEDICAS } from '../../domain/entities/Especialidade';
import { ExternalServiceError } from '../../domain/errors/ExternalServiceError';
import {
  ITriagemService,
  TriagemResultado,
} from '../../domain/services/ITriagemService';
import { buildTriagemSystemPrompt } from './buildTriagemSystemPrompt';
import { TriagemOutputSchema } from './TriagemOutputSchema';

const MODELO = 'gemini-3.5-flash';

// Schema no dialeto proprio da API do Gemini (nao aceita o schema zod
// diretamente, ao contrario do SDK da Anthropic) - a validacao real da
// resposta usa o mesmo TriagemOutputSchema (zod) compartilhado com o
// AnthropicTriagemService, entao as duas implementacoes nunca podem
// divergir sobre o que e uma resposta valida.
const GEMINI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    especialidade: {
      type: 'string',
      enum: [...ESPECIALIDADES_MEDICAS],
    },
    justificativa: { type: 'string' },
  },
  required: ['especialidade', 'justificativa'],
};

export class GeminiTriagemService implements ITriagemService {
  private client: GoogleGenAI | undefined;

  private getClient(): GoogleGenAI {
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    return this.client;
  }

  async sugerirEspecialidade(sintomas: string): Promise<TriagemResultado> {
    try {
      const response = await this.getClient().models.generateContent({
        model: MODELO,
        contents: `${buildTriagemSystemPrompt()}\n\nSintomas do paciente: ${sintomas}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      });

      const texto = response.text;

      if (!texto) {
        throw new ExternalServiceError(
          'Triagem indisponível',
          'O modelo de IA não retornou nenhuma resposta.',
        );
      }

      const parsedBody: unknown = JSON.parse(texto);
      const parsed = TriagemOutputSchema.safeParse(parsedBody);

      if (!parsed.success) {
        throw new ExternalServiceError(
          'Triagem indisponível',
          'O modelo de IA não retornou uma resposta no formato esperado.',
        );
      }

      return parsed.data;
    } catch (error) {
      throw this.paraErroExterno(error);
    }
  }

  private paraErroExterno(error: unknown): ExternalServiceError {
    if (error instanceof ExternalServiceError) {
      return error;
    }

    console.error('[GeminiTriagemService] erro inesperado:', error);

    return new ExternalServiceError(
      'Triagem indisponível',
      'Erro inesperado ao consultar o serviço de IA.',
    );
  }
}
