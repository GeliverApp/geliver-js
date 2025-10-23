import { GeliverClient } from '../src/index.js';

function makeTransport(responses: Record<string, { status: number; body: any }>) {
  return async (input: RequestInfo, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    const key = new URL(url).pathname + (new URL(url).search || '');
    const resp = responses[key];
    if (!resp) return new Response(null, { status: 404 });
    return new Response(JSON.stringify(resp.body), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
  };
}

test('list shipments via envelope', async () => {
  const transport = makeTransport({
    '/api/v1/shipments': {
      status: 200,
      body: { result: true, data: [{ id: 's1' }, { id: 's2' }], limit: 2, page: 1, totalRows: 2, totalPages: 1 },
    },
  });
  const client = new GeliverClient({ token: 'test', transport });
  const list = await client.shipments.list();
  expect(list.data.length).toBe(2);
});

