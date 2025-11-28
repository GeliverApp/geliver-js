# Geliver JS SDK

[![npm version](https://img.shields.io/npm/v/@geliver/sdk.svg)](https://www.npmjs.com/package/@geliver/sdk) [![Node.js Version](https://img.shields.io/node/v/@geliver/sdk.svg)](https://www.npmjs.com/package/@geliver/sdk)

Geliver JS SDK — official TypeScript/Node.js client for Geliver Kargo Pazaryeri (Shipping Marketplace) API.
Türkiye’nin e‑ticaret gönderim altyapısı için kolay kargo entegrasyonu sağlar.

• Dokümantasyon (TR/EN): https://docs.geliver.io

---

## İçindekiler

- Kurulum
- Yapılandırma
- Hızlı Başlangıç
- Adım Adım
- Örnekler
- Modeller
- Enum Kullanımı
- Notlar ve İpuçları
- Diğer Örnekler (JS/TS)
- Sağlayıcı Hesapları (Kendi kargo anlaşmanız)

## Kurulum

- Projenize ekleyip yerelde derleyin (açık kaynak yayın planlanıyor):
  - `npm i && npm run build`

## Akış (TR)

1. Geliver Kargo API tokenı alın (https://app.geliver.io/apitokens adresinden)
   Aşağıda İngilizce adımların Türkçe açıklamaları yer alır. Kod örnekleri İngilizce kalacaktır.
2. Gönderici adresi oluşturun (createSender)
3. Gönderi oluşturun; alıcıyı ya ID ile (recipientAddressID) ya da adres nesnesi ile (recipientAddress) verin
4. Teklifler tamamlanana kadar bekleyin ve en ucuz/istediğiniz teklifi kabul edin (acceptOffer)
5. Barkod, takip numarası, etiket URL’lerini yanıt içindeki gönderi (shipment) nesnesinden alın
6. Takip numarası hemen oluşmazsa test gönderilerinde her GET isteği durumun bir adım ilerlemesini sağlar; prod'da webhook kurun
   -7. Etiket dosyasını (PDF) ve dinamik etiketi (HTML) indirin
7. İade gönderisi oluşturmak isterseniz createReturn fonksiyonunu kullanın

## Yapılandırma

- `baseUrl` default `https://api.geliver.io/api/v1`
- `timeoutMs` default `30000`
- `maxRetries` default `2` (429/5xx)
- `userAgent` optional

## Hızlı Başlangıç

```ts
import { GeliverClient } from "@geliver/sdk";

const client = new GeliverClient({ token: process.env.GELIVER_TOKEN });

const sender = await client.addresses.createSender({
  name: "ACME Inc.",
  email: "ops@acme.test",
  address1: "Hasan mahallesi",
  countryCode: "TR",
  cityName: "İstanbul",
  cityCode: "34",
  districtName: "Esenyurt",
  phone: "+905551112233",
  zip: "34020",
});

console.log("Sender created:", sender);

const created = await client.shipments.createTest({
  senderAddressID: sender.id,
  recipientAddress: {
    name: "John Doe",
    email: "john@example.com",
    address1: "Hasan mahallesi",
    countryCode: "TR",
    cityName: "İstanbul",
    cityCode: "34",
    districtName: "Kadıköy",
    phone: "+905551112233",
    zip: "34000",
  },
  // Request dimensions/weight must be strings
  length: "10.0",
  width: "10.0",
  height: "10.0",
  distanceUnit: "cm",
  weight: "1.0",
  massUnit: "kg",
  order: {
    orderNumber: "WEB-12345",
    // sourceIdentifier alanına mağazanızın tam adresini (ör. https://magazam.com) gönderin.
    sourceIdentifier: "https://magazam.com",
    totalAmount: "150",
    totalAmountCurrency: "TRY",
  },
});

console.log("Shipment created:", created);
```

Canlı ortamda `client.shipments.createTest(...)` yerine `client.shipments.create(...)` kullanın.

## Türkçe Akış (TR)

1. Gönderici adresi oluşturma

Her gönderici adresi için tek seferlik kullanılır. Gönderici ID'sini saklayınız.

```ts
import { GeliverClient } from "@geliver/sdk";

const client = new GeliverClient({ token: process.env.GELIVER_TOKEN! });

const sender = await client.addresses.createSender({
  name: "ACME Inc.",
  email: "ops@acme.test",
  phone: "+905051234567",
  address1: "Hasan mahallesi",
  countryCode: "TR",
  cityName: "Istanbul",
  cityCode: "34",
  districtName: "Esenyurt",
  zip: "34020",
  shortName: "Warehouse-1",
});
```

2. Gönderi oluşturma (iki adım; teklifleri al)

```ts
// Seçenek A: Alıcıyı adres nesnesiyle (inline) gönderin
const created = await client.shipments.create({
  senderAddressID: sender.id,
  recipientAddress: {
    name: "John Doe",
    email: "john@example.com",
    address1: "Atatürk Mahallesi",
    countryCode: "TR",
    cityName: "İstanbul",
    cityCode: "34",
    districtName: "Kadıköy",
    phone: "+905551112233",
    zip: "34000",
  },
  length: "10.0",
  width: "10.0",
  height: "10.0",
  distanceUnit: "cm",
  weight: "1.0",
  massUnit: "kg",
  order: {
    orderNumber: "WEB-12345",
    // sourceIdentifier alanına mağazanızın tam adresini (ör. https://magazam.com) gönderin.
    sourceIdentifier: "https://magazam.com",
    totalAmount: "150",
    totalAmountCurrency: "TRY",
  },
});

// Etiket indirme: Teklif kabulünden sonra (Transaction) gelen URL'leri kullanabilirsiniz de; URL'lere her shipment nesnesinin içinden ulaşılır.

// Teklifler create yanıtında hazır olabilir; create yanıtındaki offers alanını kullanın
const offers: any = (created as any).offers;
const cheapest = offers?.cheapest;
if (!cheapest) {
  throw new Error(
    "Cheapest offer missing (henüz hazır değil). Tekrar GET /shipments yapmayı deneyin."
  );
}
const tx = await client.transactions.acceptOffer(cheapest.id);
console.log("Purchased label:", tx.id, tx.isPayed);
console.log("Barcode:", tx.shipment?.barcode);
console.log("Tracking number:", tx.shipment?.trackingNumber);
console.log("Label URL:", tx.shipment?.labelURL);
console.log("Tracking URL:", tx.shipment?.trackingUrl);

// acceptOffer (teklifi kabul etme) yanıtı, güncel Shipment'i içerir
// (barkod, labelURL ve varsa takip linkleri dahil).
```

## Alıcı ID'si ile oluşturma (recipientAddressID)

```ts
// Seçenek B: Alıcıyı mevcut adres ID'si ile gönderin
const recipient = await client.addresses.createRecipient({
  name: "John Doe",
  email: "john@example.com",
  address1: "Atatürk Mahallesi",
  countryCode: "TR",
  cityName: "İstanbul",
  cityCode: "34",
  districtName: "Kadıköy",
  phone: "+905551112233",
  zip: "34000",
});

const createdDirect = await client.shipments.create({
  senderAddressID: sender.id,
  recipientAddressID: recipient.id,
  providerServiceCode: "SURAT_STANDART",
  length: "10.0",
  width: "10.0",
  height: "10.0",
  distanceUnit: "cm",
  weight: "1.0",
  massUnit: "kg",
});

// Etiket indirme: Teklif kabulünden sonra (Transaction) gelen URL'leri kullanabilirsiniz de.
```

## Test gönderilerinde durum ilerletme ve etiket indirme

````ts
// Test gönderilerinde her GET /shipments isteği kargo durumunu bir adım ilerletir; prod'da webhook veya kendi sisteminizin kontrollerini tercih edin.
for (let i = 0; i < 5; i++) {
  await new Promise(r => setTimeout(r, 1000));
  await client.shipments.get(created.id);
}
const latest = await client.shipments.get(created.id);
console.log('Final tracking status:', (latest as any).trackingStatus?.trackingStatusCode, (latest as any).trackingStatus?.trackingSubStatusCode);

// 4) Download labels (teklif kabulünden sonra Transaction.Shipment URL'leriyle)
```ts
if (tx.shipment?.labelURL) {
  const pdfBytes = await client.shipments.downloadLabelByUrl(tx.shipment.labelURL);
  await import('node:fs/promises').then(fs => fs.writeFile('label.pdf', pdfBytes));
}
if (tx.shipment?.responsiveLabelURL) {
  const html = await client.shipments.downloadResponsiveLabelByUrl(tx.shipment.responsiveLabelURL);
  await import('node:fs/promises').then(fs => fs.writeFile('label.html', html));
}
````

## İade Gönderisi Oluşturun

```ts
const returned = await client.shipments.createReturn(created.id, {
  willAccept: true,
  providerServiceCode: "SURAT_STANDART",
  count: 1,
});
```

Not:

- `providerServiceCode` alanı opsiyoneldir. Varsayılan olarak orijinal gönderinin sağlayıcısı kullanılır; isterseniz bu alanı vererek değiştirebilirsiniz.
- `senderAddress` alanı opsiyoneldir. Varsayılan olarak orijinal gönderinin alıcı adresi kullanılır; isterseniz `senderAddress` vererek değiştirebilirsiniz.

## Webhooklar

```ts
import http from "node:http";
import { verifyWebhookSignature } from "@geliver/sdk";

http
  .createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/webhooks/geliver") {
      const chunks: Buffer[] = [];
      for await (const ch of req) chunks.push(ch as Buffer);
      const body = Buffer.concat(chunks).toString("utf8");
      const ok = verifyWebhookSignature(body, req.headers as any, {
        enableVerification: false,
      });
      if (!ok) {
        res.statusCode = 400;
        return res.end("invalid");
      }
      const evt = JSON.parse(body);
      // process evt
      res.end("ok");
    } else {
      res.statusCode = 404;
      res.end();
    }
  })
  .listen(3000);
```

### Webhookları Yönetme

```ts
await client.webhooks.create({ url: "https://yourapp.test/webhooks/geliver" });
const list = await client.webhooks.list();
```

## Örnekler

- Full flow: `examples/full-flow.mjs`
- Tek aşamada gönderi (Create Transaction): `examples/onestep.mjs`
- Kapıda ödeme: `examples/pod.mjs`
- Kendi anlaşmanızla etiket satın alma: `examples/ownagreement.mjs`
- Üretilmiş tipler `@geliver/sdk` altında (kaynak: `src/models`).

### Manuel takip kontrolü (isteğe bağlı)

```ts
async function checkTracking(shipmentId: string) {
  const s = (await client.shipments.get(shipmentId)) as any;
  const ts = s.trackingStatus;
  console.log("Status:", ts?.trackingStatusCode, ts?.trackingSubStatusCode);
}
await checkTracking(created.id);
```

## Modeller

- Shipment, Transaction, TrackingStatus, Address, ParcelTemplate, ProviderAccount, Webhook, Offer, PriceQuote and more.
- Full list is generated from OpenAPI: `src/models/index.ts`.

### Enum Kullanımı (TR)

```ts
// TypeScript tarafında enumlar string literal union olarak gelir
// Aşağıdaki alanlar için sadece geçerli değerleri kullanın (IDE otomatik tamamlar)
await client.shipments.create({
  senderAddressID: sender.id,
  recipientAddressID: recipient.id,
  distanceUnit: "cm", // ShipmentDistanceUnit
  massUnit: "kg", // ShipmentMassUnit
  // labelFileType sunucu yanıtında 'PDF' | 'JPG' | 'ZPLII' | 'ZPL' olabilir
});
```

## Notlar ve İpuçları (TR)

- Ondalıklı sayılar (ör: length/weight) API'de string olarak döner; TypeScript tarafında `string | number` olarak işlenir.
- Teklifler asenkron üretildiği için %100 tamamlanana kadar bekleyin; çok sık sorgulamayın (1 sn aralık yeterlidir).
- İade (return) için `createReturn` kullanabilirsiniz.
- Test gönderileri için `client.shipments.create({ ..., test: true })` veya `createTest(...)` yardımcı fonksiyonunu kullanın; canlı ortamda `createTest` yerine `client.shipments.create(...)` çağırın.
- Takip numarası ile takip URL'si bazı kargo firmalarında teklif kabulünün hemen ardından oluşmayabilir. Paketi kargo şubesine teslim ettiğinizde veya kargo sizden teslim aldığında bu alanlar tamamlanır. Webhooklar ile değerleri otomatik çekebilir ya da teslimden sonra `shipment` GET isteği yaparak güncel bilgileri alabilirsiniz.

- Adres kuralları: phone alanı gönderici ve alıcı adresleri için zorunludur. Zip alanı gönderici adresi için zorunludur; alıcı adresi için opsiyoneldir. `addresses.createSender(...)` phone/zip eksikse, `addresses.createRecipient(...)` phone eksikse hata verir.

## Hatalar ve İstisnalar

- İstemci şu durumlarda hata fırlatır: (1) HTTP 4xx/5xx; (2) JSON envelope `result === false`.
- Hata sınıfı `GeliverError` ve alanları: `code?: string`, `status?: number`, `additionalMessage?: string`, `responseBody?: any`, `message`.

```ts
try {
  await client.shipments.create({
    /* ... */
  });
} catch (e: any) {
  if (e?.name === "GeliverError") {
    console.error("code:", e.code);
    console.error("message:", e.message);
    console.error("additionalMessage:", e.additionalMessage);
    console.error("status:", e.status);
  } else {
    console.error("unexpected error", e);
  }
}
```

- Şehir/İlçe seçimi: cityCode ve cityName bir arada veya ayrı kullanılabilir; eşleşme açısından cityCode daha güvenlidir. Şehir/ilçe bilgilerini API ile alabilirsiniz:

```ts
// Şehir listesi (ülke kodu ile)
const cities = await client.geo.listCities("TR");
// İlçe listesi (ülke + şehir kodu ile)
const districts = await client.geo.listDistricts("TR", "34");
```

### Diğer Örnekler (JS/TS)

- Geo

```ts
// List cities by country code
const cities = await client.geo.listCities("TR");
// List districts by country + city code
const districts = await client.geo.listDistricts("TR", "34");
```

## Sağlayıcı Hesapları

```ts
// Create provider account
const createdAcc = await client.providers.createAccount({
  username: "user",
  password: "pass",
  name: "My Account",
  providerCode: "SURAT",
  version: 1,
  isActive: true,
  isPublic: false,
  sharable: false,
  isDynamicPrice: false,
});
// List accounts
const provs = await client.providers.listAccounts();
// Delete account (optional flag to remove connection)
await client.providers.deleteAccount(createdAcc.id, {
  isDeleteAccountConnection: true,
});
```

## Kargo Şablonları (Kendi kargo anlaşmanız)

```ts
// Create template
const tpl = await client.parcelTemplates.create({
  name: "Small Box",
  distanceUnit: "cm",
  massUnit: "kg",
  height: "4",
  length: "4",
  weight: "1",
  width: "4",
});
// List templates
const tpls = await client.parcelTemplates.list();
// Delete template
await client.parcelTemplates.delete(tpl.id);
```

---

[![Geliver Kargo Pazaryeri](https://geliver.io/geliverlogo.png)](https://geliver.io/)
Geliver Kargo Pazaryeri: https://geliver.io/

Etiketler (Tags): node, typescript, javascript, sdk, api-client, geliver, kargo, kargo-pazaryeri, shipping, e-commerce, turkey
