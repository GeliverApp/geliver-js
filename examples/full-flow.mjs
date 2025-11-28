import { GeliverClient } from '../dist/index.js';
import { writeFile, mkdir } from 'node:fs/promises';

const token = process.env.GELIVER_TOKEN;
if (!token) { console.error('GELIVER_TOKEN is required'); process.exit(1); }

const client = new GeliverClient({ token });

const sender = await client.addresses.createSender({
  name: 'ACME Inc.', email: 'ops@acme.test', phone: '+905051234567',
  address1: 'Hasan mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
  districtName: 'Esenyurt', zip: '34020', isRecipientAddress: false,
});
// Inline recipientAddress (adres kaydı oluşturmadan) 
const shipment = await client.shipments.createTest({
  senderAddressID: sender.id,
  recipientAddress: {
    name: 'John Doe', email: 'john@example.com', phone: '+905051234568',
    address1: 'Hasan mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34',
    districtName: 'Esenyurt', zip: '34020'
  },
  order: { orderNumber: 'ABC12333322', sourceIdentifier: 'https://magazaadresiniz.com', totalAmount: '150', totalAmountCurrency: 'TL' },
  // Request dimensions/weight must be strings
  length: '10.0', width: '10.0', height: '10.0', distanceUnit: 'cm', weight: '1.0', massUnit: 'kg',
});
// Etiketler bazı akışlarda create sonrasında hazır olabilir; varsa hemen indirin
await mkdir('output', { recursive: true });
// Etiket indirme: Teklif kabulünden sonra (Transaction) gelen URL'leri kullanabilirsiniz de; URL'lere her shipment nesnesinin içinden ulaşılır.
const offers = shipment.offers;
const cheapest = offers?.cheapest;
if (!cheapest) {
  console.error('No cheapest offer available');
  process.exit(1);
}

let tx;
try {
  tx = await client.transactions.acceptOffer(cheapest.id);
} catch (err) {
  console.error('Accept offer error:', err.message || err);
  if (err.response) {
    console.error('API Error:', err.response.status, err.response.data);
  }
  process.exit(1);
}
console.log('tx', tx.id, tx.isPayed);

// Etiket indirme: LabelFileType kontrolü
// Eğer LabelFileType "PROVIDER_PDF" ise, LabelURL'den indirilen PDF etiket kullanılmalıdır.
// Eğer LabelFileType "PDF" ise, responsiveLabelURL (HTML) dosyası kullanılabilir.
if (tx.shipment) {
  if (tx.shipment.labelFileType === 'PROVIDER_PDF') {
    // PROVIDER_PDF: Sadece PDF etiket kullanılmalı
    if (tx.shipment.labelURL) {
      const pdf = await client.shipments.downloadLabel(shipment.id);
      await writeFile('output/label-node.pdf', pdf);
      console.log('PDF etiket indirildi (PROVIDER_PDF)');
    }
  } else if (tx.shipment.labelFileType === 'PDF') {
    // PDF: ResponsiveLabel (HTML) kullanılabilir
    if (tx.shipment.responsiveLabelURL) {
      const html = await client.shipments.downloadResponsiveLabel(shipment.id);
      await writeFile('output/label-node.html', html);
      console.log('HTML etiket indirildi (PDF)');
    }
    // İsteğe bağlı olarak PDF de indirilebilir
    if (tx.shipment.labelURL) {
      const pdf = await client.shipments.downloadLabel(shipment.id);
      await writeFile('output/label-node.pdf', pdf);
    }
  }
}

// Test gönderilerinde her GET /shipments isteği kargo durumunu bir adım ilerletir.
// Canlıda bu şekilde polling yapmayın; webhook veya kendi sisteminizin periyodik kontrollerini kullanın.
/*for (let i = 0; i < 5; i++) {
  await new Promise(r => setTimeout(r, 1000));
  await client.shipments.get(shipment.id);
}*/
const finalStatus = await client.shipments.get(shipment.id);
console.log('Final tracking status:', finalStatus.trackingStatus?.trackingStatusCode, finalStatus.trackingStatus?.trackingSubStatusCode);
console.log('done');
