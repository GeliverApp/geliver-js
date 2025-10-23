# Geliver JS SDK

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
  - `cd sdks/js && npm i && npm run build`

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

const client = new GeliverClient({ token: process.env.GELIVER_TOKEN! });

const sender = await client.addresses.createSender({
  name: "ACME Inc.",
  email: "ops@acme.test",
  address1: "Street 1",
  countryCode: "TR",
  cityName: "Istanbul",
  cityCode: "34",
  districtName: "Esenyurt",
  districtID: 107605,
  zip: "34020",
});

const created = await client.shipments.createTest({
  sourceCode: "API",
  senderAddressID: sender.id,
  recipientAddress: {
    name: "John Doe",
    email: "john@example.com",
    address1: "Dest St 2",
    countryCode: "TR",
    cityName: "Istanbul",
    cityCode: "34",
    districtName: "Kadikoy",
    districtID: 100000,
    zip: "34000",
  },
  length: 10,
  width: 10,
  height: 10,
  distanceUnit: "cm",
  weight: 1,
  massUnit: "kg",
});
```

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
  address1: "Street 1",
  countryCode: "TR",
  cityName: "Istanbul",
  cityCode: "34",
  districtName: "Esenyurt",
  districtID: 107605,
  zip: "34020",
  shortName: "Warehouse-1",
});
```

2. Gönderi oluşturma (iki adım; teklifleri al)

```ts
// Seçenek A: Alıcıyı adres nesnesiyle (inline) gönderin
const created = await client.shipments.create({
  sourceCode: "API",
  senderAddressID: sender.id,
  recipientAddress: {
    name: "John Doe",
    email: "john@example.com",
    address1: "Dest St 2",
    countryCode: "TR",
    cityName: "Istanbul",
    cityCode: "34",
    districtName: "Kadikoy",
    districtID: 100000,
    zip: "34000",
  },
  length: 10,
  width: 10,
  height: 10,
  distanceUnit: "cm",
  weight: 1,
  massUnit: "kg",
});

// Etiketler bazı akışlarda create sonrasında hazır olabilir; varsa hemen indirin
if ((created as any).labelURL) {
  const prePdf = await client.shipments.downloadLabel(created.id);
  await import("node:fs/promises").then((fs) =>
    fs.writeFile("label_pre.pdf", prePdf)
  );
}
if ((created as any).responsiveLabelURL) {
  const preHtml = await client.shipments.downloadResponsiveLabel(created.id);
  await import("node:fs/promises").then((fs) =>
    fs.writeFile("label_pre.html", preHtml)
  );
}

// Teklifler create yanıtında hazır olabilir; önce onu kontrol edin
let offers: any = (created as any).offers;
if (!(offers && (offers.percentageCompleted >= 99 || offers.cheapest))) {
  // Hazır değilse, >= %99 olana kadar 1 sn aralıkla sorgulayın (backend 99'da kalabilir)
  let done = false;
  while (!done) {
    const s = await client.shipments.get(created.id);
    offers = (s as any).offers;
    if (offers && (offers.percentageCompleted >= 99 || offers.cheapest))
      done = true;
    else await new Promise((r) => setTimeout(r, 1000));
  }
}

const cheapest = offers?.cheapest;
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
  address1: "Dest St 2",
  countryCode: "TR",
  cityName: "Istanbul",
  cityCode: "34",
  districtName: "Kadikoy",
  districtID: 100000,
  zip: "34000",
});

const createdDirect = await client.shipments.create({
  sourceCode: "API",
  senderAddressID: sender.id,
  recipientAddressID: recipient.id,
  providerServiceCode: "MNG_STANDART",
  length: 10,
  width: 10,
  height: 10,
  distanceUnit: "cm",
  weight: 1,
  massUnit: "kg",
});

// Etiket hazırsa, recipientAddressID ile oluşturulan gönderide de hemen indirilebilir
if ((createdDirect as any).labelURL) {
  const prePdf2 = await client.shipments.downloadLabel(createdDirect.id);
  await import("node:fs/promises").then((fs) =>
    fs.writeFile("label_pre_direct.pdf", prePdf2)
  );
}
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

// 4) Download labels
```ts
const pdfBytes = await client.shipments.downloadLabel(created.id);
// dosyaya kaydet
await import('node:fs/promises').then(fs => fs.writeFile('label.pdf', pdfBytes));

const html = await client.shipments.downloadResponsiveLabel(created.id);
await import('node:fs/promises').then(fs => fs.writeFile('label.html', html));
````

## İade Gönderisi Oluşturun

```ts
const returned = await client.shipments.createReturn(created.id, {
  willAccept: true,
  providerServiceCode: "SURAT_STANDART",
  count: 1,
});
```

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

- Çalıştırılabilir örnek akış için: `sdks/js/examples/full-flow.ts`.
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
  sourceCode: "API",
  senderAddressID: sender.id,
  recipientAddressID: recipient.id,
  distanceUnit: "cm", // ShipmentDistanceUnit
  massUnit: "kg", // ShipmentMassUnit
  // labelFileType sunucu yanıtında 'PDF' | 'JPG' | 'ZPLII' | 'ZPL' olabilir
});
```

## Notlar ve İpuçları (TR)

- Ondalıklı sayılar (ör: length/weight) API'de string olarak döner; TypeScript tarafında `string | number` olarak işlenir.
- Teklifler asenkron üretildiği için >= %99 tamamlanana kadar bekleyin (backend 99'da kalabilir); çok sık sorgulamayın (1 sn aralık yeterlidir).
- İade (return) için `createReturn` kullanabilirsiniz.
- Test gönderileri için `client.shipments.create({ ..., test: true })` veya `createTest(...)` yardımcı fonksiyonunu kullanın.
- İlçe seçimi: districtID (number) kullanmanız önerilir. districtName her zaman kesin eşleşmeyebilir.
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

## Sağlayıcı Hesapları

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
