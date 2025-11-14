import { HttpClient } from '../http.js';
import { ProviderAccount, ProviderAccountRequest } from '../api-types.js';
import { ResponseEnvelope } from '../types.js';

export class ProvidersResource {
  constructor(private http: HttpClient) {}

  /** Create a provider account connection. */
  createAccount(body: ProviderAccountRequest): Promise<ProviderAccount> {
    return this.http.request('POST', '/provideraccounts', { body });
  }

  /** List provider accounts (returns full envelope). */
  listAccounts(): Promise<ResponseEnvelope<ProviderAccount[]>> {
    return this.http.request('GET', '/provideraccounts');
  }

  /** Delete provider account connection. */
  deleteAccount(providerAccountID: string, opts: { isDeleteAccountConnection?: boolean } = {}): Promise<{ result: boolean } | any> {
    const query = opts.isDeleteAccountConnection !== undefined ? { isDeleteAccountConnection: opts.isDeleteAccountConnection } : undefined;
    return this.http.request('DELETE', `/provideraccounts/${encodeURIComponent(providerAccountID)}`, { query });
  }
}
