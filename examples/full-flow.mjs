import { GeliverClient } from '../dist/index.js';
import { writeFile, mkdir } from 'node:fs/promises';

const token = process.env.GELIVER_TOKEN;
if (!token) { console.error('GELIVER_TOKEN is required'); process.exit(1); }

const client = new GeliverClient({ token });

const sender = await client.addresses.createSender({
  name: 'ACME Inc.', email: 'ops@acme.test', phone: '+905051234567',
  address1: 'Street 1', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
  districtName: 'Esenyurt', districtID: 107605, zip: '34020', isRecipientAddress: false,
});
// Inline recipientAddress (adres kaydı oluşturmadan) 
const shipment = await client.shipments.createTest({
  sourceCode: 'API', senderAddressID: sender.id,
  recipientAddress: {
    name: 'John Doe', email: 'john@example.com', phone: '+905051234568',
    address1: 'Dest St 2', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
    districtName: 'Esenyurt', districtID: 107605, zip: '34020'
  },
  length: 10, width: 10, height: 10, distanceUnit: 'cm', weight: 1, massUnit: 'kg',
});
// Etiketler bazı akışlarda create sonrasında hazır olabilir; varsa hemen indirin
await mkdir('sdks/output', { recursive: true });
if (shipment.labelURL) {
  const prePdf = await client.shipments.downloadLabel(shipment.id);
  await writeFile('sdks/output/label-node-pre.pdf', prePdf);
}
if (shipment.responsiveLabelURL) {
  const preHtml = await client.shipments.downloadResponsiveLabel(shipment.id);
  await writeFile('sdks/output/label-node-pre.html', preHtml);
}
// Teklifler create yanıtında hazır olabilir; önce onu kontrol edin
let offers = shipment.offers;
if (!(offers && (offers.percentageCompleted >= 99 || offers.cheapest))) {
  const start = Date.now();
  while (true) {
    const s = await client.shipments.get(shipment.id);
    offers = s.offers;
    if (offers && (offers.percentageCompleted >= 99 || offers.cheapest)) break;
    if (Date.now() - start > 60000) throw new Error('Timed out waiting for offers');
    await new Promise(r => setTimeout(r, 1000));
  }
}
const cheapest = offers.cheapest;
const tx = await client.transactions.acceptOffer(cheapest.id);
console.log('tx', tx.id, tx.isPayed);
if (tx.shipment?.labelURL) {
  const pdf = await client.shipments.downloadLabel(shipment.id);
  await writeFile('sdks/output/label-node.pdf', pdf);
}
if (tx.shipment?.responsiveLabelURL) {
  const html = await client.shipments.downloadResponsiveLabel(shipment.id);
  await writeFile('sdks/output/label-node.html', html);
}

// Test gönderilerinde her GET /shipments isteği kargo durumunu bir adım ilerletir.
// Üretimde bu şekilde polling yapmayın; webhook veya kendi sisteminizin periyodik kontrollerini kullanın.
for (let i = 0; i < 5; i++) {
  await new Promise(r => setTimeout(r, 1000));
  await client.shipments.get(shipment.id);
}
const finalStatus = await client.shipments.get(shipment.id);
console.log('Final tracking status:', finalStatus.trackingStatus?.trackingStatusCode, finalStatus.trackingStatus?.trackingSubStatusCode);
console.log('done');
