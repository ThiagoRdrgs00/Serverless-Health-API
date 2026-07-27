# Serverless Health API

API serverless (AWS Lambda + API Gateway REST API) para consulta de agendas médicas e criação de agendamentos de consulta, construída com **Serverless Framework** e **TypeScript**. Dados mantidos em memória — sem banco de dados.

**Stack:** Node.js 20+ / TypeScript (`strict`, CommonJS, sem `any`) · Serverless Framework v3 · serverless-offline + serverless-esbuild · Zod · Jest · ESLint + Prettier.

## Pré-requisitos

- **Node.js 20+** e **npm**
- Para fazer deploy real (opcional): uma **conta AWS** e credenciais configuradas localmente — ver seção [Deploy na AWS](#deploy-na-aws)
- Para usar o endpoint `/triagem`: uma chave de API do [Google AI Studio](https://aistudio.google.com/apikey) (Gemini, tier gratuito) — ver seção [`POST /triagem`](#post-triagem)

## Como rodar localmente

```bash
npm install
npm run offline
```

O servidor sobe em `http://localhost:3000/dev`, simulando o API Gateway + Lambda. O prefixo `/dev` faz parte do formato do API Gateway REST API (v1), que sempre inclui o stage no path.

## Arquitetura

```
domain/          → entidades, erros tipados e interfaces de repositório (sem dependência externa)
application/     → Use Cases (regra de negócio) e DTOs — dependem só de domain/
infrastructure/  → implementações concretas dos repositórios (hoje: em memória)
presentation/    → handler Lambda, roteador, validação e formatação HTTP
shared/          → composition root (injeção de dependência manual)
```

Handlers extraem dados do evento, chamam o Use Case e formatam a resposta — nenhuma regra de negócio mora ali, o que torna os `Use Cases` testáveis com Jest puro, sem mockar AWS.

Preocupações transversais (logging, tratamento de erro, validação) são encapsuladas como decorators/funções de ordem superior (`presentation/http/withLogging.ts`, `withErrorHandling.ts`, `withValidation.ts`) e um decorator de classe (`@logExecution`, em `shared/decorators/`) aplicado aos Use Cases.

## Endpoints

> Base URL local: `http://localhost:3000/dev`

### `GET /agendas`

Retorna médicos e horários disponíveis. A disponibilidade é **calculada**, não armazenada: cada médico tem uma lista fixa de horários, e um horário só é considerado disponível se não existir nenhum agendamento (médico + horário) registrado. Nesta implementação em memória isso é uma comparação linear simples; em produção, com volume real de dados, seria resolvido com uma consulta indexada (ex.: uma `Query` no DynamoDB por `medico_id`, ou um atributo de status por horário), não por varredura em memória.

```json
{
  "medicos": [
    {
      "id": 1,
      "nome": "Dr. João Silva",
      "especialidade": "Cardiologista",
      "horarios_disponiveis": ["2026-06-10 09:00", "2026-06-10 10:00"]
    }
  ]
}
```

### `POST /agendamento`

**Request**

```json
{
  "agendamento": {
    "medico_id": 1,
    "paciente": "Carlos Almeida",
    "data_horario": "2026-06-10 09:00"
  }
}
```

| Status  | Quando                                                                                                   | Corpo                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **201** | Sucesso                                                                                                  | `{ "mensagem": "Agendamento realizado com sucesso", "agendamento": { "id", "medico", "paciente", "data_horario" } }` |
| **400** | Payload inválido (tipo errado, campo vazio, formato de data errado, ou horário fora da agenda do médico) | `{ "erro": "Payload inválido", "mensagem": "..." }`                                                                  |
| **404** | `medico_id` não existe                                                                                   | `{ "erro": "Médico não encontrado", "mensagem": "..." }`                                                             |
| **409** | Horário já ocupado                                                                                       | `{ "erro": "Horário indisponível", "mensagem": "O horário solicitado não está mais disponível para este médico." }`  |

A pasta [`postman/`](./postman) tem requisições prontas para importar no Postman (sucesso, conflito, payload inválido) — ver [`postman/README.md`](./postman/README.md).

### `POST /triagem` (diferencial)

Recebe a descrição de sintomas em texto livre e sugere uma especialidade médica, usando uma LLM com _structured outputs_ (schema `zod`, garantindo que a especialidade sempre venha de uma lista fechada). **Não é diagnóstico** — apenas uma sugestão de triagem inicial.

`ITriagemService` (`domain/services/`) tem **duas implementações prontas**, trocáveis em uma linha (`shared/container/services.ts`), sem tocar Use Case, rota ou testes:

| Implementação                             | Modelo             | Custo                                |
| ----------------------------------------- | ------------------ | ------------------------------------ |
| `GeminiTriagemService` (ativa por padrão) | `gemini-3.5-flash` | Tier gratuito, sem cartão de crédito |
| `AnthropicTriagemService` (alternativa)   | `claude-haiku-4-5` | Pago (créditos mínimos na conta)     |

**Setup:** copie `.env.example` para `.env` e preencha `GEMINI_API_KEY` com uma chave gerada em [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

**Request**

```json
{ "sintomas": "Dor forte no peito, falta de ar e palpitações há duas horas" }
```

| Status  | Quando                                                                                         | Corpo                                                                   |
| ------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **200** | Sucesso                                                                                        | `{ "especialidade_sugerida": "Cardiologista", "justificativa": "..." }` |
| **400** | `sintomas` ausente, vazio, ou fora do tamanho esperado (10–1000 caracteres)                    | `{ "erro": "Payload inválido", "mensagem": "..." }`                     |
| **502** | Falha na chamada à API de IA (chave inválida, rate limit, indisponibilidade, recusa do modelo) | `{ "erro": "Triagem indisponível", "mensagem": "..." }`                 |

## Diferenciais implementados

- **Testes de integração** (`npm run test:integration`): invocam o `handler` da Lambda diretamente com eventos sintéticos — roteador, rotas, Use Cases e repositórios reais, sem mocks. Complementam os testes unitários (que mockam as dependências).
- **Decorators**: ver seção [Arquitetura](#arquitetura) acima.
- **Agente de IA** (`POST /triagem`): ver acima.

## Testes automatizados

```bash
npm test              # todos (unitários + integração)
npm run test:unit      # só os unitários dos Use Cases
npm run test:integration  # só os de integração
```

Os **Use Cases** (regra de negócio) têm testes **unitários** isolados, mockando as interfaces de repositório. Além deles, `handler.integration.spec.ts` invoca o `handler` da Lambda diretamente com eventos sintéticos — roteador, rotas, Use Cases e repositórios reais, sem nenhum mock — cobrindo os mesmos cenários (200/201/400/404/409) de forma automatizada. Outros scripts úteis: `npm run typecheck`, `npm run lint`, `npm run format`.

`TriarSintomasUseCase` (endpoint `/triagem`) só tem teste **unitário** (mockando `ITriagemService`) — deliberadamente sem teste de integração, já que isso chamaria uma API de IA de verdade a cada execução da suíte (não-determinismo desnecessário, e custo real caso a implementação ativa seja a paga).

## Deploy na AWS

Requer uma conta AWS e credenciais configuradas localmente (`aws configure`, ou `npx serverless config credentials --provider aws --key ... --secret ...`), com um usuário IAM com permissão para criar Lambda, API Gateway, IAM Roles e CloudFormation.

```bash
npm run deploy                    # deploy no stage "dev" (padrão)
npm run deploy -- --stage prod    # deploy em outro stage
```

O comando compila o código (esbuild), empacota a função e cria/atualiza uma stack do CloudFormation (`serverless-health-api-{stage}`) com a Lambda, o API Gateway REST API e a IAM Role de execução. Ao final, o terminal imprime a URL pública da API.

Para remover todos os recursos criados:

```bash
npx serverless remove
```

## Decisão técnica própria

**Uma única Lambda com roteador interno** (`presentation/handlers/api/handler.ts`), em vez de uma por rota: cada função Lambda é empacotada separadamente pelo `serverless-esbuild`, então estado em memória não é compartilhado entre funções diferentes — descobri isso na prática, testando. Como o enunciado exige dados em memória (sem banco), unificar as rotas numa única Lambda foi a solução que encontrei para elas compartilharem estado de forma consistente. Isso também é o que permite testar de ponta a ponta os cenários de exceção do agendamento (ex.: reservar um horário e, na tentativa seguinte, receber o 409 de conflito, ou ver o `GET /agendas` refletindo a reserva) — com Lambdas separadas, esse fluxo de teste manual não seria confiável. É pragmática para essa restrição específica, não uma recomendação geral: em produção real, a resposta certa seria um banco de dados compartilhado (ex.: DynamoDB), mantendo funções separadas.
