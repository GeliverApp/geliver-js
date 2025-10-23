import { HttpClient } from '../http.js';
import { OrganizationBalance } from '../api-types.js';

export class OrganizationsResource {
  constructor(private http: HttpClient) {}
  /** Get organization balance information. */
  getBalance(organizationId: string): Promise<OrganizationBalance> {
    return this.http.request('GET', `/organizations/${encodeURIComponent(organizationId)}/balance`);
  }
}
