import { HttpClient, ClientOptions } from './http.js';
import { ShipmentsResource } from './resources/shipments.js';
import { TransactionsResource } from './resources/transactions.js';
import { AddressesResource } from './resources/addresses.js';
import { WebhooksResource } from './resources/webhooks.js';
import { ParcelTemplatesResource } from './resources/parcelTemplates.js';
import { ProvidersResource } from './resources/providers.js';
import { PricesResource } from './resources/prices.js';
import { GeoResource } from './resources/geo.js';
import { OrganizationsResource } from './resources/organizations.js';
export * from './types.js';
export * from './webhooks.js';
export * from './models/index.js';

export class GeliverClient {
  readonly http: HttpClient;
  readonly shipments: ShipmentsResource;
  readonly transactions: TransactionsResource;
  readonly addresses: AddressesResource;
  readonly webhooks: WebhooksResource;
  readonly parcelTemplates: ParcelTemplatesResource;
  readonly providers: ProvidersResource;
  readonly prices: PricesResource;
  readonly geo: GeoResource;
  readonly organizations: OrganizationsResource;

  constructor(options: ClientOptions) {
    this.http = new HttpClient(options);
    this.shipments = new ShipmentsResource(this.http);
    this.transactions = new TransactionsResource(this.http);
    this.addresses = new AddressesResource(this.http);
    this.webhooks = new WebhooksResource(this.http);
    this.parcelTemplates = new ParcelTemplatesResource(this.http);
    this.providers = new ProvidersResource(this.http);
    this.prices = new PricesResource(this.http);
    this.geo = new GeoResource(this.http);
    this.organizations = new OrganizationsResource(this.http);
  }
}
