import { HttpClient } from '../http.js';
import { CreateAddressRequest } from '../requests.js';
import { Address } from '../models/index.js';

export class AddressesResource {
  constructor(private http: HttpClient) {}

  /**
   * Create an address.
   * When isRecipientAddress is true, it's a recipient address; otherwise a sender address.
   */
  create(body: CreateAddressRequest): Promise<Address> {
    return this.http.request('POST', '/addresses', { body });
  }

  /** Create a sender address (isRecipientAddress=false). */
  createSender(body: Omit<CreateAddressRequest, 'isRecipientAddress'>): Promise<Address> {
    if (!body.phone) throw new Error('phone is required for sender addresses');
    if (!body.zip) throw new Error('zip is required for sender addresses');
    return this.create({ ...body, isRecipientAddress: false });
  }

  /** Create a recipient address (isRecipientAddress=true). */
  createRecipient(body: Omit<CreateAddressRequest, 'isRecipientAddress'>): Promise<Address> {
    if (!body.phone) throw new Error('phone is required for recipient addresses');
    // zip optional for recipients
    return this.create({ ...body, isRecipientAddress: true });
  }

  /** List addresses with optional pagination and role filter. */
  list(params?: { isRecipientAddress?: boolean; limit?: number; page?: number }): Promise<{ data: Address[]; limit?: number; page?: number; totalRows?: number; totalPages?: number; }> {
    return this.http.request('GET', '/addresses', { query: params as any });
  }

  /** Get address by ID. */
  get(addressID: string): Promise<Address> {
    return this.http.request('GET', `/addresses/${encodeURIComponent(addressID)}`);
  }

  /** Delete address by ID. */
  delete(addressID: string): Promise<{ result: boolean } | any> {
    return this.http.request('DELETE', `/addresses/${encodeURIComponent(addressID)}`);
  }
}
