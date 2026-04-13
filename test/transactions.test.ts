import { GeliverClient } from '../src/index.js';

function makeTransport(assertReq: (init?: RequestInit) => void, responseBody: any) {
  return async (_input: RequestInfo, init?: RequestInit) => {
    assertReq(init);
    return new Response(JSON.stringify(responseBody), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
}

test('create transaction wraps shipment', async () => {
  const transport = makeTransport((init) => {
    const body = JSON.parse(String(init?.body ?? 'null'));
    expect(body.test).toBeUndefined();
    expect(body.shipment.test).toBe(true);
    expect(body.providerServiceCode).toBe('SURAT_STANDART');
    expect(body.providerAccountID).toBe('acc-1');
    expect(body.shipment.providerServiceCode).toBeUndefined();
    expect(body.shipment.providerAccountID).toBeUndefined();
    expect(body.shipment.order.sourceCode).toBe('SDK');
    expect(typeof body.shipment.length).toBe('string');
    expect(typeof body.shipment.weight).toBe('string');
  }, { result: true, data: { id: 'tx1', offerID: 'offer-123', isPayed: true } });

  const client = new GeliverClient({ token: 'test', transport });
  const tx = await client.transactions.create({
    senderAddressID: 'sender-1',
    recipientAddress: { name: 'R', phone: '+905000000000', address1: 'A', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34', districtName: 'Esenyurt' } as any,
    length: 10.5 as any,
    weight: 1.25 as any,
    distanceUnit: 'cm',
    massUnit: 'kg',
    test: true,
    providerServiceCode: 'SURAT_STANDART' as any,
    providerAccountID: 'acc-1' as any,
    order: { orderNumber: 'ORDER-1' } as any,
  } as any);
  expect(tx.id).toBe('tx1');
});
