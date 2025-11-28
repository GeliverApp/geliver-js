import { GeliverClient } from '../dist/index.js';

const token = process.env.GELIVER_TOKEN;
if (!token) { console.error('GELIVER_TOKEN required'); process.exit(1); }
const client = new GeliverClient({ token });

const sender = await client.addresses.createSender({
  name: 'POD Sender', email: 'sender@example.com',
  address1: 'Hasan Mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34', districtName: 'Esenyurt', zip: '34020',
});

const tx = await client.transactions.create({
  senderAddressID: sender.id,
  recipientAddress: {
    name: 'POD Recipient', phone: '+905000000001', address1: 'Atatürk Mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34', districtName: 'Esenyurt',
  },
  length: '10.0', width: '10.0', height: '10.0', distanceUnit: 'cm', weight: '1.0', massUnit: 'kg',
  providerServiceCode: 'PTT_KAPIDA_ODEME',
  productPaymentOnDelivery: true,
  order: { orderNumber: 'POD-12345', totalAmount: '150', totalAmountCurrency: 'TRY' },
});
console.log('transaction id:', tx.id);
