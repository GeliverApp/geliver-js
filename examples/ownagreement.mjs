import { GeliverClient } from '../dist/index.js';

const token = process.env.GELIVER_TOKEN;
if (!token) { console.error('GELIVER_TOKEN required'); process.exit(1); }
const client = new GeliverClient({ token });

const sender = await client.addresses.createSender({
  name: 'OwnAg Sender', email: 'sender@example.com',
  address1: 'Hasan Mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34', districtName: 'Esenyurt', zip: '34020',
});

const tx = await client.transactions.create({
  senderAddressID: sender.id,
  recipientAddress: {
    name: 'OwnAg Recipient', phone: '+905000000002', address1: 'Atatürk Mahallesi', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34', districtName: 'Esenyurt',
  },
  length: '10.0', width: '10.0', height: '10.0', distanceUnit: 'cm', weight: '1.0', massUnit: 'kg',
  providerServiceCode: 'SURAT_STANDART',
  providerAccountID: 'c0dfdb42-012d-438c-9d49-98d13b4d4a2b',
});
console.log('transaction id:', tx.id);
