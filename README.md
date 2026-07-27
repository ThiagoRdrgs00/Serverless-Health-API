# Serverless Health API

API serverless (AWS Lambda + API Gateway REST API) para consulta de agendas médicas e criação de agendamentos de consulta, construída com **Serverless Framework** e **TypeScript**. Dados mantidos em memória — sem banco de dados.

**Stack:** Node.js 20+ / TypeScript (`strict`, ESM, sem `any`) · Serverless Framework v3 · serverless-offline + serverless-esbuild · Zod · Jest · ESLint + Prettier.

## Pré-requisitos

- **Node.js 20+** e **npm**
- Para fazer deploy real (opcional): uma **conta AWS** e credenciais configuradas localmente — ver seção [Deploy na AWS](#deploy-na-aws)

## Como rodar localmente

```bash
npm install
npm run offline
```

O servidor sobe em `http://localhost:3000/dev`, simulando o API Gateway + Lambda. O prefixo `/dev` faz parte do formato do API Gateway REST API (v1), que sempre inclui o stage no path.

## Arquitetura

Clean Architecture em camadas, com inversão de dependência (SOLID) entre elas:

```
domain/          → entidades, erros tipados e interfaces de repositório (sem dependência externa)
application/     → Use Cases (regra de negócio) e DTOs — dependem só de domain/
infrastructure/  → implementações concretas dos repositórios (hoje: em memória)
presentation/    → handler Lambda, roteador, validação e formatação HTTP
shared/          → composition root (injeção de dependência manual)
```

Handlers são deliberadamente finos: extraem dados do evento, chamam o Use Case e formatam a resposta — nenhuma regra de negócio mora ali, o que torna os `Use Cases` testáveis com Jest puro, sem mockar AWS.

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

| Status | Quando | Corpo |
|---|---|---|
| **201** | Sucesso | `{ "mensagem": "Agendamento realizado com sucesso", "agendamento": { "id", "medico", "paciente", "data_horario" } }` |
| **400** | Payload inválido (tipo errado, campo vazio, formato de data errado, ou horário fora da agenda do médico) | `{ "erro": "Payload inválido", "mensagem": "..." }` |
| **404** | `medico_id` não existe | `{ "erro": "Médico não encontrado", "mensagem": "..." }` |
| **409** | Horário já ocupado | `{ "erro": "Horário indisponível", "mensagem": "O horário solicitado não está mais disponível para este médico." }` |

A pasta [`postman/`](./postman) tem requisições `curl` prontas para importar no Postman (sucesso, conflito, payload inválido) — ver [`postman/README.md`](./postman/README.md).

## Testes automatizados

```bash
npm test
```

Os **Use Cases** (regra de negócio) são testados isoladamente com Jest, mockando as interfaces de repositório. Outros scripts úteis: `npm run typecheck`, `npm run lint`, `npm run format`.

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
