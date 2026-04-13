import { GeliverClient } from '../dist/index.js';

const token = process.env.GELIVER_TOKEN;
const shipmentID = process.env.GELIVER_RETURN_SHIPMENT_ID ?? process.argv[2];

if (!token || !shipmentID) {
  console.error('Set GELIVER_TOKEN and GELIVER_RETURN_SHIPMENT_ID, or pass the shipment ID as the first argument.');
  process.exit(1);
}

const client = new GeliverClient({ token });
const returned = await client.shipments.createReturn(shipmentID, {});
console.log('Return shipment:', returned.id);
console.log('Label is not purchased yet. This example waits for offers and buys it with acceptOffer.');

let current = returned;
let offers = current.offers;
const deadline = Date.now() + 60_000;

while (!offers?.cheapest?.id) {
  if (Date.now() >= deadline) {
    console.error('Timed out waiting for return offers.');
    process.exit(1);
  }
  console.log('Waiting offers...', offers?.percentageCompleted ?? 0, '%');
  await new Promise(resolve => setTimeout(resolve, 1000));
  current = await client.shipments.get(returned.id);
  offers = current.offers;
}

const tx = await client.transactions.acceptOffer(offers.cheapest.id);
console.log('Transaction:', tx.id);
console.log('Purchased return shipment:', tx.shipment?.id ?? null);
