import { GeliverError, ResponseEnvelope } from './types.js';

export type HeadersInitLike = Record<string, string>;

export interface ClientOptions {
  baseUrl?: string; // default: https://api.geliver.io/api/v1
  token: string;
  timeoutMs?: number; // default: 30000
  maxRetries?: number; // default: 2
  userAgent?: string;
  transport?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const DEFAULT_BASE_URL = 'https://api.geliver.io/api/v1';

export class HttpClient {
  readonly baseUrl: string;
  readonly token: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly userAgent?: string;
  readonly transport: (input: RequestInfo, init?: RequestInit) => Promise<Response>;

  constructor(opts: ClientOptions) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.token = opts.token;
    this.timeoutMs = opts.timeoutMs ?? 30000;
    this.maxRetries = opts.maxRetries ?? 2;
    this.userAgent = opts.userAgent;
    this.transport = opts.transport ?? (globalThis.fetch?.bind(globalThis) as any);
    if (!this.transport) {
      throw new Error('fetch is not available; provide a custom transport');
    }
  }

  private buildHeaders(extra?: HeadersInitLike): HeadersInit {
    const headers: HeadersInitLike = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
    if (this.userAgent) headers['User-Agent'] = this.userAgent;
    if (extra) Object.assign(headers, extra);
    return headers;
  }

  async request<T = any>(method: string, path: string, options: {
    query?: Record<string, any>;
    body?: any;
    headers?: HeadersInitLike;
    signal?: AbortSignal;
  } = {}): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v === undefined || v === null) continue;
        url.searchParams.append(k, String(v));
      }
    }

    const body = options.body === undefined ? undefined : JSON.stringify(options.body);
    const headers = this.buildHeaders(options.headers);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const signal = options.signal ?? controller.signal;

    let attempt = 0;
    let lastError: any;
    while (attempt <= this.maxRetries) {
      try {
        const res = await this.transport(url.toString(), {
          method, headers, body, signal,
        });
        clearTimeout(timer);
        const text = await res.text();
        let json: any;
        try { json = text ? JSON.parse(text) : undefined; } catch { json = undefined; }

        if (!res.ok) {
          const err = new GeliverError(`HTTP ${res.status}` , {
            status: res.status,
            code: (json as any)?.code,
            responseBody: json ?? text,
            additionalMessage: (json as any)?.additionalMessage,
          });
          if (this.shouldRetry(res.status, attempt)) {
            attempt++;
            await this.backoff(attempt);
            continue;
          }
          throw err;
        }

        // Unwrap response envelope if applicable
        const envelope = json as ResponseEnvelope<any> | undefined;
        if (envelope && (envelope.data !== undefined || envelope.result !== undefined)) {
          if (envelope.result === false) {
            throw new GeliverError(envelope.message || 'API error', {
              code: (envelope as any)?.code,
              responseBody: json,
              additionalMessage: envelope.additionalMessage,
            });
          }
          // If pagination-like fields exist, return full envelope to preserve metadata; otherwise return data
          const hasPaging = envelope && (envelope.limit !== undefined || envelope.page !== undefined || envelope.totalPages !== undefined || envelope.totalRows !== undefined);
          if (hasPaging) return json as T;
          return (envelope.data as T) ?? (json as T);
        }
        return (json as T) ?? (undefined as unknown as T);
      } catch (e: any) {
        lastError = e;
        if (e?.name === 'AbortError') throw e;
        attempt++;
        if (attempt > this.maxRetries) break;
        await this.backoff(attempt);
      }
    }
    throw lastError;
  }

  private shouldRetry(status: number, attempt: number) {
    if (attempt >= this.maxRetries) return false;
    if (status === 429) return true;
    if (status >= 500) return true;
    return false;
  }

  private async backoff(attempt: number) {
    const base = 200 * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 100;
    const wait = Math.min(2000, base + jitter);
    await new Promise(r => setTimeout(r, wait));
  }

  // Perform a raw request to an absolute URL using the configured transport.
  async raw(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.transport(url, { ...init, signal: controller.signal });
      return res as any;
    } finally {
      clearTimeout(timer);
    }
  }
}
