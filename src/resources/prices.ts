import { HttpClient } from '../http.js';

export interface PriceListParams {
  paramType: 'parcel';
  length: number;
  width: number;
  height: number;
  weight: number;
  distanceUnit?: string;
  massUnit?: string;
}

export class PricesResource {
  constructor(private http: HttpClient) {}
  /** Get price list for given parcel dimensions/weight. */
  listPrices(params: PriceListParams): Promise<any> {
    return this.http.request('GET', '/priceList', { query: params as any });
  }
}
