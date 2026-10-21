import test from 'node:test';
import assert from 'node:assert/strict';

import { ShipmentsResource } from '../dist/resources/shipments.js';
import { TransactionsResource } from '../dist/resources/transactions.js';

test('shipments.create supports all incoming address combinations without swapping them', async () => {
  const calls = [];
  const shipments = new ShipmentsResource({
    request: async (method, path, opts) => {
      calls.push({ method, path, body: opts.body });
      return { id: 'incoming-1' };
    },
  });

  const senders = [
    { senderAddressID: 'customer-1' },
    { senderAddress: { name: 'Customer', phone: '+905051234567', address1: 'A' } },
  ];
  const recipients = [
    { recipientAddressID: 'merchant-1' },
    { recipientAddress: { name: 'Merchant', phone: '+905051234568', address1: 'B' } },
  ];

  for (const sender of senders) {
    for (const recipient of recipients) {
      const body = { isReturn: true, ...sender, ...recipient };
      await shipments.create(body);
      assert.deepEqual(calls.at(-1), { method: 'POST', path: '/shipments', body });
    }
  }
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
