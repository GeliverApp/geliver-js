export interface ResponseEnvelope<T> {
  result?: boolean;
  message?: string;
  code?: string;
  additionalMessage?: string;
  limit?: number;
  page?: number;
  totalRows?: number;
  totalPages?: number;
  data?: T;
}

export interface ApiErrorPayload {
  code?: string; // e.g., E1051
  message?: string;
  details?: unknown;
}

export class GeliverError extends Error {
  code?: string;
  status?: number;
  responseBody?: any;
  additionalMessage?: string;
  constructor(message: string, opts?: { code?: string; status?: number; responseBody?: any; additionalMessage?: string }) {
    super(message);
    this.name = 'GeliverError';
    this.code = opts?.code;
    this.status = opts?.status;
    this.responseBody = opts?.responseBody;
    this.additionalMessage = opts?.additionalMessage;
  }
}

// Use generated models for Shipment/Transaction/etc.

export interface ListParams {
  limit?: number;
  page?: number;
  sortBy?: string | null;
  filter?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  statusFilter?: string | null;
  invoiceID?: string | null;
  merchantCode?: string | null;
  orderNumber?: string | null;
  providerServiceCode?: string | null;
  storeIdentifier?: string | null;
  isReturned?: boolean | null;
}
