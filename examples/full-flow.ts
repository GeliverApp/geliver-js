import { GeliverClient } from '../src/index.ts';
import type { CreateShipmentRequest } from '../src/requests';

async function main() {
  const token = process.env.GELIVER_TOKEN!;
  const client = new GeliverClient({ token });

  const sender = await client.addresses.createSender({
    name: 'ACME Inc.', email: 'ops@acme.test', phone: '+905051234567',
    address1: 'Street 1', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
    districtName: 'Esenyurt', districtID: 107605, zip: '34020'
  });

  // Inline recipientAddress without saving
  const senderId = sender.id as string;
  if (!senderId) throw new Error('sender.id is undefined');
  const shipment = await client.shipments.createTest({
    sourceCode: 'API', senderAddressID: senderId,
    recipientAddress: {
      name: 'John Doe', email: 'john@example.com', phone: '+905051234568',
      address1: 'Dest St 2', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
      districtName: 'Esenyurt', districtID: 107605, zip: '34020'
    },
  // Request dimensions/weight must be strings
  length: '10.0', width: '10.0', height: '10.0', distanceUnit: 'cm', weight: '1.0', massUnit: 'kg',
  } as Omit<CreateShipmentRequest, 'test'>);

  // Etiket indirme: Teklif kabulünden sonra (Transaction) gelen URL'leri kullanabilirsiniz de; URL'lere her shipment nesnesinin içinden ulaşılır.

  // Teklifler create yanıtında hazır olabilir; önce onu kontrol edin
  let offers: any = (shipment as any).offers;
  if (!(offers && (offers.percentageCompleted == 100 || offers.cheapest))) {
    const start = Date.now();
    while (true) {
      const s = await client.shipments.get(shipment.id as string) as any;
      offers = s.offers;
      if (offers && (offers.percentageCompleted == 100 || offers.cheapest)) break;
      if (Date.now() - start > 60000) throw new Error('Timed out waiting for offers');
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  const cheapest = offers.cheapest;
  const tx = await client.transactions.acceptOffer(cheapest.id);
  console.log('Transaction', tx.id, tx.isPayed);
  console.log('Barcode:', tx.shipment?.barcode);
  console.log('Tracking number:', tx.shipment?.trackingNumber);
  console.log('Label URL:', tx.shipment?.labelURL);
  console.log('Tracking URL:', tx.shipment?.trackingUrl);

  // Test gönderilerinde her GET /shipments çağrısı kargo durumunu bir adım ilerletir; prod'da webhook veya kendi sisteminiz önerilir.
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 1000));
    await client.shipments.get(shipment.id as string);
  }
  const finalStatus = await client.shipments.get(shipment.id as string) as any;
  console.log('Final tracking status:', finalStatus?.trackingStatus?.trackingStatusCode, finalStatus?.trackingStatus?.trackingSubStatusCode);
  
  // Manual tracking check (on-demand status read)
  const latest = await client.shipments.get(shipment.id as string) as any;
  console.log('Status:', latest?.trackingStatus?.trackingStatusCode, latest?.trackingStatus?.trackingSubStatusCode);

  // Download labels
  if (tx.shipment?.labelURL) {
    const pdf = await client.shipments.downloadLabelByUrl(tx.shipment.labelURL);
    await import('node:fs/promises').then(fs => fs.writeFile('label.pdf', pdf));
  }
  if (tx.shipment?.responsiveLabelURL) {
    const html = await client.shipments.downloadResponsiveLabelByUrl(tx.shipment.responsiveLabelURL);
    await import('node:fs/promises').then(fs => fs.writeFile('label.html', html));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
