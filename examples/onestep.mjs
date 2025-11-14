import { GeliverClient } from '../dist/index.js';

const token = process.env.GELIVER_TOKEN;
if (!token) { console.error('GELIVER_TOKEN required'); process.exit(1); }
const client = new GeliverClient({ token });

const sender = await client.addresses.createSender({
  name: 'OneStep Sender', email: 'sender@example.com',
  address1: 'Street 1', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34', districtName: 'Esenyurt', zip: '34020',
});

const tx = await client.transactions.create({
  senderAddressID: sender.id,
  recipientAddress: {
    name: 'OneStep Recipient', phone: '+905000000000', address1: 'Dest 2', countryCode: 'TR', cityName: 'Istanbul', cityCode: '34', districtName: 'Esenyurt',
  },
  length: '10.0', width: '10.0', height: '10.0', distanceUnit: 'cm', weight: '1.0', massUnit: 'kg',
});
console.log('transaction id:', tx.id);
