import { HttpClient } from '../http.js';
import { Transaction } from '../api-types.js';

export class TransactionsResource {
  constructor(private http: HttpClient) {}

  /**
   * Accept an offer (purchase label). Returns a Transaction-like object with the last updated Shipment
   * including barcode, labelURL, tracking URL/number when available.
   */
  acceptOffer(offerID: string): Promise<Transaction> {
    return this.http.request('POST', '/transactions', { body: { offerID } });
  }
}
