import { HttpClient } from '../http.js';
import { ListParams } from '../types.js';
import { Shipment } from '../models/index.js';
import { CreateShipmentRequest, UpdatePackageRequest, CreateReturnShipmentRequest } from '../requests.js';

export class ShipmentsResource {
  constructor(private http: HttpClient) {}

  /**
   * Create a shipment. You can specify recipient either by `recipientAddressID` or an inline `recipientAddress`.
   */
  create(body: CreateShipmentRequest): Promise<Shipment> {
    const payload: any = { ...body };
    if (payload.order && !payload.order.sourceCode) payload.order.sourceCode = 'API';
    for (const k of ['length','width','height','weight']) {
      if (payload[k] !== undefined && payload[k] !== null) payload[k] = String(payload[k]);
    }
    return this.http.request('POST', '/shipments', { body: payload });
  }

  /** Create a test shipment easily without modifying your body. */
  createTest(body: Omit<CreateShipmentRequest, 'test'>): Promise<Shipment> {
    const payload: any = { ...(body as any) };
    if (payload.order && !payload.order.sourceCode) payload.order.sourceCode = 'API';
    payload.test = true;
    return this.http.request('POST', '/shipments', { body: payload });
  }

  /** Get shipment by ID. */
  get(shipmentID: string): Promise<Shipment> {
    return this.http.request('GET', `/shipments/${encodeURIComponent(shipmentID)}`);
  }

  /** List shipments with filters and pagination. */
  list(params?: ListParams): Promise<{
    limit?: number; page?: number; totalRows?: number; totalPages?: number; data: Shipment[];
  }> {
    return this.http.request('GET', '/shipments', { query: params as any });
  }

  async *listAll(params?: Omit<ListParams, 'page'>): AsyncGenerator<Shipment> {
    let page = 1;
    while (true) {
      const resp = await this.list({ ...params, page });
      for (const item of resp.data ?? []) yield item;
      const totalPages = resp.totalPages ?? 0;
      if (!totalPages || page >= totalPages) break;
      page++;
    }
  }

  /** Update package dimensions/weight for a not-yet-purchased shipment. */
  updatePackage(shipmentID: string, body: UpdatePackageRequest): Promise<Shipment> {
    const payload: any = { ...body };
    for (const k of ['length','width','height','weight']) {
      if (payload[k] !== undefined && payload[k] !== null) payload[k] = String(payload[k]);
    }
    return this.http.request('PATCH', `/shipments/${encodeURIComponent(shipmentID)}`, { body: payload });
  }

  /** Cancel a shipment by ID. */
  cancel(shipmentID: string): Promise<Shipment> {
    return this.http.request('DELETE', `/shipments/${encodeURIComponent(shipmentID)}`);
  }

  /** Clone a shipment by ID. */
  clone(shipmentID: string): Promise<Shipment> {
    return this.http.request('POST', `/shipments/${encodeURIComponent(shipmentID)}`);
  }

  /** Create a return shipment for an existing one (PATCH with isReturn=true). */
  createReturn(shipmentID: string, body: CreateReturnShipmentRequest): Promise<Shipment> {
    const payload: any = { ...body, isReturn: true };
    return this.http.request('PATCH', `/shipments/${encodeURIComponent(shipmentID)}`, { body: payload });
  }

  /** Poll until offers are fully generated or timeout. */
  async waitForOffers(shipmentID: string, opts: { intervalMs?: number; timeoutMs?: number } = {}): Promise<any> {
    const interval = opts.intervalMs ?? 1000;
    const timeout = opts.timeoutMs ?? 60000;
    const start = Date.now();
    while (true) {
      const s = await this.get(shipmentID) as any;
      const offers = s?.offers;
      if (offers && (offers.percentageCompleted >= 99 || offers.cheapest)) return offers;
      if (Date.now() - start > timeout) throw new Error('Timed out waiting for offers');
      await new Promise(r => setTimeout(r, interval));
    }
  }

  /** Poll until tracking number is available or timeout. */
  async waitForTrackingNumber(shipmentID: string, opts: { intervalMs?: number; timeoutMs?: number } = {}): Promise<Shipment> {
    const interval = opts.intervalMs ?? 3000;
    const timeout = opts.timeoutMs ?? 180000;
    const start = Date.now();
    while (true) {
      const s = await this.get(shipmentID);
      if ((s as any)?.trackingNumber) return s;
      if (Date.now() - start > timeout) throw new Error('Timed out waiting for tracking number');
      await new Promise(r => setTimeout(r, interval));
    }
  }

  /** Download label PDF bytes by URL. */
  async downloadLabelByUrl(url: string): Promise<Uint8Array> {
    const res = await this.http.raw(url);
    if (!res.ok) throw new Error(`Failed to download label: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }

  /** Download label PDF for a shipment using `labelURL`. */
  async downloadLabel(shipmentID: string): Promise<Uint8Array> {
    const s = await this.get(shipmentID) as any;
    if (!s?.labelURL) throw new Error('Shipment has no labelURL');
    return this.downloadLabelByUrl(s.labelURL);
  }

  /** Download responsive label HTML by URL. */
  async downloadResponsiveLabelByUrl(url: string): Promise<string> {
    const res = await this.http.raw(url);
    if (!res.ok) throw new Error(`Failed to download responsive label: ${res.status}`);
    return await res.text();
  }

  /** Download responsive label HTML for a shipment. */
  async downloadResponsiveLabel(shipmentID: string): Promise<string> {
    const s = await this.get(shipmentID) as any;
    const url = s?.responsiveLabelURL || s?.responsiveLabelUrl;
    if (!url) throw new Error('Shipment has no responsiveLabelURL');
    return this.downloadResponsiveLabelByUrl(url);
  }
}
