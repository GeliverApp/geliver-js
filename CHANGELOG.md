# Changelog

Bu dosya SDK'daki önemli değişiklikleri listeler.

This file documents notable changes in the SDK.

## Sürüm / Version

- Türkçe: Bu değişiklikler `1.4.0` sürümünde yer alır.
- English: These changes are included in version `1.4.0`.

## Türkçe

### 1.4.0

- Tüm yeni gönderilerde gönderici ve alıcı için adres ID veya satır içi adresin tam olarak biri doğrulanır.
- `shipments.create(...)` ile referans gönderi olmadan `isReturn: true` ve gönderici/alıcı için bağımsız ID veya satır içi adres seçimi desteklenir.
- `examples/incoming-shipment.mjs` eklendi.

### 1.3.0

#### Eklendi

- `transactions.createReturn(...)` ile iadeyi oluşturup etiketi hemen satın alma akışı eklendi.
- İki yeni iade örneği eklendi:
  - `examples/return-shipment.mjs`
  - `examples/return-transaction.mjs`

#### Değişti

- `shipments.createReturn(...)` artık shipment-only iade akışıdır ve etiketi satın almaz.
- İade dokümanı iki akışı ayrı anlatır.
- README örnekleri, etiketin daha sonra `transactions.acceptOffer(...)` ile satın alınabileceğini açıklar.

## English

### 1.4.0

- All new shipment flows validate that each side provides exactly one address ID or inline address.
- `shipments.create(...)` supports independent incoming returns with `isReturn: true` and either an address ID or an inline address for each side.
- Added `examples/incoming-shipment.mjs`.

### 1.3.0

#### Added

- Added `transactions.createReturn(...)` for creating a return shipment and purchasing the label immediately.
- Added return examples for:
  - `examples/return-shipment.mjs`
  - `examples/return-transaction.mjs`

#### Changed

- `shipments.createReturn(...)` now represents the shipment-only return flow and does not purchase the label.
- Return documentation now explains the two return flows separately.
- README examples now document that label purchase can be performed later with `transactions.acceptOffer(...)`.
