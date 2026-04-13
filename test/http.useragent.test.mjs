import test from 'node:test';
import assert from 'node:assert/strict';

import { HttpClient } from '../dist/http.js';

test('http sets default User-Agent in Node', async () => {
  const calls = [];
  const transport = async (_input, init) => {
    calls.push(init);
    return new Response(JSON.stringify({ result: true, data: { ok: true } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const http = new HttpClient({ token: 'test', transport });
  await http.request('GET', '/ping');

  assert.equal(calls.length, 1);
  const headers = calls[0]?.headers;
  const ua =
    headers instanceof Headers
      ? headers.get('User-Agent')
      : Array.isArray(headers)
        ? headers.find(([k]) => String(k).toLowerCase() === 'user-agent')?.[1]
        : headers?.['User-Agent'] ?? headers?.['user-agent'];

  assert.equal(ua, 'geliver-js/1.2.1');
});

