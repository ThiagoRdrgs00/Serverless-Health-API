import { GeminiTriagemService } from '../../infrastructure/ai/GeminiTriagemService';

// AnthropicTriagemService também implementa ITriagemService (mesma interface) -
// trocar de provedor é só trocar esta linha, sem tocar em Use Case, rota ou
// testes unitários (que mockam ITriagemService, não a implementação concreta).
// Usando Gemini aqui por ter tier gratuito genuíno, sem cartão de crédito.
export const triagemService = new GeminiTriagemService();
// export const triagemService = new AnthropicTriagemService();
