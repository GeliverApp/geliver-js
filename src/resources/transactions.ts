import { HttpClient } from '../http.js';
import { Transaction } from '../api-types.js';
import { CreateShipmentRequest } from '../requests.js';

type CreateTransactionRequest = {
  shipment: CreateShipmentRequest;
  providerServiceCode?: string | null;
  providerAccountID?: string | null;
};

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
  create(body: CreateShipmentRequest | CreateTransactionRequest): Promise<Transaction> {
    const maybeWrapper: any = body as any;
    const shipmentBody =
      maybeWrapper && typeof maybeWrapper === 'object' && maybeWrapper.shipment && typeof maybeWrapper.shipment === 'object'
        ? maybeWrapper.shipment
        : body;

    const payload: any = { ...(shipmentBody as any) };
    if (payload.order && !payload.order.sourceCode) payload.order.sourceCode = 'API';
    if (payload.recipientAddress && !payload.recipientAddress.phone) throw new Error('recipientAddress.phone is required');
    for (const k of ['length','width','height','weight']) {
      if (payload[k] !== undefined && payload[k] !== null) payload[k] = String(payload[k]);
    }
    const wrapper: any = { shipment: payload };
    const providerServiceCode = maybeWrapper?.providerServiceCode ?? payload.providerServiceCode;
    if (providerServiceCode !== undefined && providerServiceCode !== null) {
      wrapper.providerServiceCode = providerServiceCode;
      delete payload.providerServiceCode;
    }
    const providerAccountID = maybeWrapper?.providerAccountID ?? payload.providerAccountID;
    if (providerAccountID !== undefined && providerAccountID !== null) {
      wrapper.providerAccountID = providerAccountID;
      delete payload.providerAccountID;
    }
    return this.http.request('POST', '/transactions', { body: wrapper });
  }
}
