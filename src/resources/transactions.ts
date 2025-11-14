import { HttpClient } from '../http.js';
import { Transaction } from '../api-types.js';
import { CreateShipmentRequest } from '../requests.js';

export class TransactionsResource {
  constructor(private http: HttpClient) {}

  /**
   * Accept an offer (purchase label). Returns a Transaction-like object with the last updated Shipment
   * including barcode, labelURL, tracking URL/number when available.
   */
  acceptOffer(offerID: string): Promise<Transaction> {
    return this.http.request('POST', '/transactions', { body: { offerID } });
  }

  /**
   * One-step label purchase: post shipment details directly to /transactions.
   * No accept flow; server creates shipment and returns Transaction.
   */
  create(body: CreateShipmentRequest): Promise<Transaction> {
    const payload: any = { ...body };
    if (payload.order && !payload.order.sourceCode) payload.order.sourceCode = 'API';
    if (payload.recipientAddress && !payload.recipientAddress.phone) throw new Error('recipientAddress.phone is required');
    for (const k of ['length','width','height','weight']) {
      if (payload[k] !== undefined && payload[k] !== null) payload[k] = String(payload[k]);
    }
    return this.http.request('POST', '/transactions', { body: payload });
  }
}
