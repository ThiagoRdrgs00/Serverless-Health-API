import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler';

// Evento sintetico minimo (formato REST API v1). O handler so le
// httpMethod/path/body, entao os demais campos ficam com valores
// vazios/neutros - so precisam satisfazer o tipo.
function makeEvent(
  overrides: Partial<APIGatewayProxyEvent>,
): APIGatewayProxyEvent {
  return {
    resource: '',
    path: '',
    httpMethod: 'GET',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    body: null,
    isBase64Encoded: false,
    ...overrides,
  };
}

describe('handler (integração — roteador + rotas + Use Cases + repositórios reais, sem mocks)', () => {
  it('GET /agendas retorna 200 com a lista de médicos', async () => {
    const result = await handler(
      makeEvent({ httpMethod: 'GET', path: '/agendas' }),
    );

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(Array.isArray(body.medicos)).toBe(true);
    expect(body.medicos.length).toBeGreaterThan(0);
  });

  it('POST /agendamento com payload válido retorna 201', async () => {
    const result = await handler(
      makeEvent({
        httpMethod: 'POST',
        path: '/agendamento',
        body: JSON.stringify({
          agendamento: {
            medico_id: 1,
            paciente: 'Integração Teste',
            data_horario: '2026-06-10 09:00',
          },
        }),
      }),
    );

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.mensagem).toBe('Agendamento realizado com sucesso');
    expect(body.agendamento.medico).toBe('Dr. João Silva');
  });

  it('reservar o mesmo horário duas vezes retorna 409 na segunda tentativa', async () => {
    const payload = JSON.stringify({
      agendamento: {
        medico_id: 2,
        paciente: 'Primeira Reserva',
        data_horario: '2026-06-11 14:00',
      },
    });

    const primeira = await handler(
      makeEvent({ httpMethod: 'POST', path: '/agendamento', body: payload }),
    );
    const segunda = await handler(
      makeEvent({ httpMethod: 'POST', path: '/agendamento', body: payload }),
    );

    expect(primeira.statusCode).toBe(201);
    expect(segunda.statusCode).toBe(409);
    expect(JSON.parse(segunda.body).erro).toBe('Horário indisponível');
  });

  it('POST /agendamento com médico inexistente retorna 404', async () => {
    const result = await handler(
      makeEvent({
        httpMethod: 'POST',
        path: '/agendamento',
        body: JSON.stringify({
          agendamento: {
            medico_id: 999,
            paciente: 'Fulano',
            data_horario: '2026-06-10 09:00',
          },
        }),
      }),
    );

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).erro).toBe('Médico não encontrado');
  });

  it('POST /agendamento com payload inválido retorna 400', async () => {
    const result = await handler(
      makeEvent({
        httpMethod: 'POST',
        path: '/agendamento',
        body: JSON.stringify({
          agendamento: { medico_id: '1', paciente: '', data_horario: 'errado' },
        }),
      }),
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).erro).toBe('Payload inválido');
  });

  it('rota inexistente retorna 404', async () => {
    const result = await handler(
      makeEvent({ httpMethod: 'GET', path: '/rota-que-nao-existe' }),
    );

    expect(result.statusCode).toBe(404);
  });
});
