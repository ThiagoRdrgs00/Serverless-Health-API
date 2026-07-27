# Requisições para teste manual (Postman)

Como importar a collection no Postman:

1. Abra o Postman.
2. Clique em **Import** (canto superior esquerdo).
3. Selecione o arquivo `Serverless Health API.postman_collection.json`.
4. Clique em **Import**.

## Pré-requisito

O servidor local precisa estar rodando:

```bash
npm run offline
```

## Variável de collection

| Variável | Valor padrão | Descrição |
|---|---|---|
| `baseUrl` | `http://localhost:3000/dev` | Base da API local (inclui `/dev` porque o projeto usa API Gateway **REST API (v1)**) |

## Requisições disponíveis

| Requisição | Endpoint | Descrição |
|---|---|---|
| `Listar Agendas` | `GET /agendas` | Lista médicos e horários disponíveis |
| `Criar Agendamento` | `POST /agendamento` | Cria um novo agendamento (sucesso, 201) |
| `Criar Agendamento - Payload Invalido` | `POST /agendamento` | `medico_id` como string, `paciente` vazio e `data_horario` em formato errado (400) |
| `Triagem` | `POST /triagem` | Sugere especialidade médica a partir dos sintomas (sucesso, 200) |
| `Triagem - Payload Invalido` | `POST /triagem` | `sintomas` com menos de 10 caracteres (400) |

> Dica: rode `Criar Agendamento` duas vezes seguidas com o mesmo horário para ver o erro de conflito (409).
