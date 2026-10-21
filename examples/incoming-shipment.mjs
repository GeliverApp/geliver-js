import { GeliverClient } from '../dist/index.js';

const token = process.env.GELIVER_TOKEN;
const recipientAddressID = process.env.GELIVER_MERCHANT_ADDRESS_ID;
if (!token || !recipientAddressID) {
  console.error('Set GELIVER_TOKEN and GELIVER_MERCHANT_ADDRESS_ID.');
  process.exit(1);
}

const client = new GeliverClient({ token });
const shipment = await client.shipments.create({
  isReturn: true,
  test: true,
  senderAddress: {
    name: 'Müşteri Adı', email: 'customer@example.com', phone: '+905051234567',
    address1: 'Örnek Mahallesi 1', countryCode: 'TR', cityCode: '34', districtName: 'Kadıköy', zip: '34000',
  },
  recipientAddressID,
  length: '10', width: '10', height: '10', distanceUnit: 'cm', weight: '1', massUnit: 'kg',
});

console.log('Gelecek gönderi:', shipment.id);
