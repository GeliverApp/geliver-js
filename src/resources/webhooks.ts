import { HttpClient } from '../http.js';

export class WebhooksResource {
  constructor(private http: HttpClient) {}

  /** Create a webhook. */
  create(body: { url: string; type?: string }): Promise<any> {
    return this.http.request('POST', '/webhook', { body });
  }

  /** List webhooks. */
  list(): Promise<any> {
    return this.http.request('GET', '/webhook');
  }

  /** Delete a webhook by ID. */
  delete(webhookID: string): Promise<{ result: boolean } | any> {
    return this.http.request('DELETE', `/webhook/${encodeURIComponent(webhookID)}`);
  }

  /** Trigger test webhook delivery. */
  test(body: { type: string; url: string }): Promise<{ result: boolean } | any> {
    return this.http.request('PUT', '/webhook', { body });
  }
}
