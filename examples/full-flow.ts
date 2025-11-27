import { GeliverClient } from '../src/index.ts';
import type { CreateShipmentRequest } from '../src/requests';

async function main() {
  const token = process.env.GELIVER_TOKEN!;
  const client = new GeliverClient({ token });

  const sender = await client.addresses.createSender({
    name: 'ACME Inc.', email: 'ops@acme.test', phone: '+905051234567',
    address1: 'Hasan mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
    districtName: 'Esenyurt', zip: '34020'
  });

  // Inline recipientAddress without saving
  const senderId = sender.id as string;
  if (!senderId) throw new Error('sender.id is undefined');
  const shipment = await client.shipments.createTest({
    senderAddressID: senderId,
    recipientAddress: {
      name: 'John Doe', email: 'john@example.com', phone: '+905051234568',
      address1: 'Hasan mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
      districtName: 'Esenyurt', zip: '34020'
    },
    order: { orderNumber: 'ABC12333322', sourceIdentifier: 'https://magazaadresiniz.com', totalAmount: '150', totalAmountCurrency: 'TL' },
  // Request dimensions/weight must be strings
  length: '10.0', width: '10.0', height: '10.0', distanceUnit: 'cm', weight: '1.0', massUnit: 'kg',
  } as Omit<CreateShipmentRequest, 'test'>);

  // Etiket indirme: Teklif kabulünden sonra (Transaction) gelen URL'leri kullanabilirsiniz de; URL'lere her shipment nesnesinin içinden ulaşılır.

  const offers: any = (shipment as any).offers;
  const cheapest = offers?.cheapest;
  if (!cheapest) {
    throw new Error('No cheapest offer available');
  }

  let tx;
  try {
    tx = await client.transactions.acceptOffer(cheapest.id);
  } catch (err: any) {
    console.error('Accept offer error:', err.message || err);
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    }
    throw err;
  }
  console.log('Transaction', tx.id, tx.isPayed);
  console.log('Barcode:', tx.shipment?.barcode);
  console.log('Tracking number:', tx.shipment?.trackingNumber);
  console.log('Label URL:', tx.shipment?.labelURL);
  console.log('Tracking URL:', tx.shipment?.trackingUrl);

  // Etiket indirme: LabelFileType kontrolü
  // Eğer LabelFileType "PROVIDER_PDF" ise, LabelURL'den indirilen PDF etiket kullanılmalıdır.
  // Eğer LabelFileType "PDF" ise, responsiveLabelURL (HTML) dosyası kullanılabilir.
  if (tx.shipment) {
    if (tx.shipment.labelFileType === 'PROVIDER_PDF') {
      // PROVIDER_PDF: Sadece PDF etiket kullanılmalı
      if (tx.shipment.labelURL) {
        const pdf = await client.shipments.downloadLabelByUrl(tx.shipment.labelURL);
        await import('node:fs/promises').then(fs => fs.writeFile('label.pdf', pdf));
        console.log('PDF etiket indirildi (PROVIDER_PDF)');
      }
    } else if (tx.shipment.labelFileType === 'PDF') {
      // PDF: ResponsiveLabel (HTML) kullanılabilir
      if (tx.shipment.responsiveLabelURL) {
        const html = await client.shipments.downloadResponsiveLabelByUrl(tx.shipment.responsiveLabelURL);
        await import('node:fs/promises').then(fs => fs.writeFile('label.html', html));
        console.log('HTML etiket indirildi (PDF)');
      }
      // İsteğe bağlı olarak PDF de indirilebilir
      if (tx.shipment.labelURL) {
        const pdf = await client.shipments.downloadLabelByUrl(tx.shipment.labelURL);
        await import('node:fs/promises').then(fs => fs.writeFile('label.pdf', pdf));
      }
    }
  }

  // Test gönderilerinde her GET /shipments çağrısı kargo durumunu bir adım ilerletir; prod'da webhook veya kendi sisteminiz önerilir.
  /*for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 1000));
    await client.shipments.get(shipment.id as string);
  }*/

  const finalStatus = await client.shipments.get(shipment.id as string) as any;
  console.log('Final tracking status:', finalStatus?.trackingStatus?.trackingStatusCode, finalStatus?.trackingStatus?.trackingSubStatusCode);
  
  // Manual tracking check (on-demand status read)
  const latest = await client.shipments.get(shipment.id as string) as any;
  console.log('Status:', latest?.trackingStatus?.trackingStatusCode, latest?.trackingStatus?.trackingSubStatusCode);


}

main().catch(e => { console.error(e); process.exit(1); });
