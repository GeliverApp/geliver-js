import { GeliverClient } from '../dist/index.js';

const token = process.env.GELIVER_TOKEN;
const shipmentID = process.env.GELIVER_RETURN_SHIPMENT_ID ?? process.argv[2];

if (!token || !shipmentID) {
  console.error('Set GELIVER_TOKEN and GELIVER_RETURN_SHIPMENT_ID, or pass the shipment ID as the first argument.');
  process.exit(1);
}

const client = new GeliverClient({ token });
const tx = await client.transactions.createReturn(shipmentID, {});
console.log('Transaction:', tx.id);
console.log('Purchased return shipment:', tx.shipment?.id ?? null);
