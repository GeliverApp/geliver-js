import test from 'node:test';
import assert from 'node:assert/strict';

import { ShipmentsResource } from '../dist/resources/shipments.js';
import { TransactionsResource } from '../dist/resources/transactions.js';

test('shipments.create accepts merchant and customer address options for returns', async () => {
  const calls = [];
  const shipments = new ShipmentsResource({
    request: async (method, path, opts) => {
      calls.push({ method, path, body: opts.body });
      return { id: 'incoming-1' };
    },
  });

  const senders = [
    {},
    { senderAddressID: 'merchant-1' },
    { senderAddress: { name: 'Merchant', phone: '+905051234567', address1: 'A' } },
  ];
  const recipients = [
    { recipientAddressID: 'customer-1' },
    { recipientAddress: { name: 'Customer', phone: '+905051234568', address1: 'B' } },
  ];

  for (const sender of senders) {
    for (const recipient of recipients) {
      const body = { isReturn: true, ...sender, ...recipient };
      await shipments.create(body);
      assert.deepEqual(calls.at(-1), { method: 'POST', path: '/shipments', body });
    }
  }
});

test('all new shipment flows require a recipient and allow a default sender', async () => {
  let calls = 0;
  const http = { request: async () => { calls += 1; return { id: 'unexpected' }; } };
  const shipments = new ShipmentsResource(http);
  const transactions = new TransactionsResource(http);
  const base = { senderAddressID: 'merchant-1', recipientAddressID: 'customer-1' };
  const invalid = [
    { ...base, senderAddress: { address1: 'A' } },
    { ...base, recipientAddressID: undefined },
    { ...base, recipientAddress: { address1: 'B', phone: '+905051234568' } },
  ];

  for (const body of invalid) {
    assert.throws(() => shipments.create(body), /exactly one/);
    assert.throws(() => shipments.createTest(body), /exactly one/);
    assert.throws(() => transactions.create(body), /exactly one/);
  }
  assert.equal(calls, 0);

  await shipments.create({ recipientAddressID: 'customer-1' });
  await shipments.createTest({ recipientAddressID: 'customer-1' });
  await transactions.create({ recipientAddressID: 'customer-1' });
  assert.equal(calls, 3);
});

test('shipments.createReturn uses POST and sets defaults', async () => {
  const calls = [];
  const http = {
    request: async (method, path, opts) => {
      calls.push({ method, path, opts });
      return { id: 'ret-1' };
    },
  };

  const shipments = new ShipmentsResource(http);
  const returned = await shipments.createReturn('shp-1', {
    providerServiceCode: 'SURAT_STANDART',
  });

  assert.equal(returned.id, 'ret-1');
  assert.equal(calls.length, 1);

  const call = calls[0];
  assert.equal(call.method, 'POST');
  assert.equal(call.path, '/shipments/shp-1');

  const body = call.opts?.body;
  assert.equal(body.isReturn, true);
  assert.equal(body.count, 1);
  assert.equal(body.providerServiceCode, 'SURAT_STANDART');
  assert.equal('willAccept' in body, false);
});

test('shipments.createReturn rejects willAccept=true', async () => {
  const calls = [];
  const http = {
    request: async (method, path, opts) => {
      calls.push({ method, path, opts });
      return { id: 'ret-2' };
    },
  };

  const shipments = new ShipmentsResource(http);
  assert.throws(() => shipments.createReturn('shp-2', {
    willAccept: true,
    count: 0,
  }));

  assert.equal(calls.length, 0);
});

test('both createReturn flows forward the customer senderAddress without swapping it', async () => {
  const calls = [];
  const http = { request: async (method, path, opts) => {
    calls.push({ method, path, body: opts.body });
    return { id: 'return-1' };
  } };
  const customer = { name: 'Customer', phone: '+905051234567', address1: 'Pickup address' };

  await new ShipmentsResource(http).createReturn('original-1', { senderAddress: customer });
  await new TransactionsResource(http).createReturn('original-1', { senderAddress: customer });

  for (const call of calls) {
    assert.equal(call.method, 'POST');
    assert.equal(call.path, '/shipments/original-1');
    assert.deepEqual(call.body.senderAddress, customer);
    assert.equal('recipientAddress' in call.body, false);
    assert.equal('recipientAddressID' in call.body, false);
    assert.equal(call.body.isReturn, true);
  }
  assert.equal(calls[0].body.willAccept, undefined);
  assert.equal(calls[1].body.willAccept, true);
});

test('transactions.createReturn forces willAccept and sets defaults', async () => {
  const calls = [];
  const http = {
    request: async (method, path, opts) => {
      calls.push({ method, path, opts });
      return { id: 'tx-1', offerID: 'offer-1', transactionType: 'CREATE_SHIPMENT' };
    },
  };

  const transactions = new TransactionsResource(http);
  const returned = await transactions.createReturn('shp-2', {
    count: 0,
  });

  assert.equal(calls.length, 1);
  const call = calls[0];
  assert.equal(call.method, 'POST');
  assert.equal(call.path, '/shipments/shp-2');
  const body = call.opts?.body;
  assert.equal(body.isReturn, true);
  assert.equal(body.willAccept, true);
  assert.equal(body.count, 1);
  assert.equal(returned.id, 'tx-1');
});
