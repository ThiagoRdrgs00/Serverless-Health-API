# Requisições para teste manual (Postman)

Como importar cada arquivo `.curl` no Postman:

1. Abra o Postman.
2. Clique em **Import** (canto superior esquerdo).
3. Selecione a aba **Raw text**.
4. Copie e cole o conteúdo do arquivo `.curl` desejado.
5. Clique em **Continue** e depois **Import**.

## Pré-requisito

O servidor local precisa estar rodando:

```bash
npm run offline
```

## Requisições disponíveis

| Arquivo | Endpoint | Descrição |
|---|---|---|
| `listar-agendas.curl` | `GET /dev/agendas` | Lista médicos e horários disponíveis |
| `criar-agendamento.curl` | `POST /dev/agendamento` | Cria um novo agendamento (sucesso, 201) |
| `criar-agendamento-payload-invalido.curl` | `POST /dev/agendamento` | `medico_id` como string, `paciente` vazio e `data_horario` em formato errado (400) |

> Nota: as URLs incluem `/dev` porque o projeto usa API Gateway **REST API (v1)**
>
> Dica: rode `criar-agendamento.curl` duas vezes seguidas com o mesmo horário para ver o erro de conflito (409).
