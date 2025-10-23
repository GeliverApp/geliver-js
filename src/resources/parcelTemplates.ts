import { HttpClient } from '../http.js';
import { ParcelTemplate } from '../api-types.js';

export class ParcelTemplatesResource {
  constructor(private http: HttpClient) {}

  create(body: Partial<ParcelTemplate>): Promise<ParcelTemplate> {
    return this.http.request('POST', '/parceltemplates', { body });
  }

  list(): Promise<{ data: ParcelTemplate[] }> {
    return this.http.request('GET', '/parceltemplates');
  }

  delete(templateID: string): Promise<{ result: boolean } | any> {
    return this.http.request('DELETE', `/parceltemplates/${encodeURIComponent(templateID)}`);
  }
}
