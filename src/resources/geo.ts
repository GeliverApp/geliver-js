import { HttpClient } from '../http.js';
import { City, District } from '../models/index.js';

export class GeoResource {
  constructor(private http: HttpClient) {}

  /** List cities for a country code (e.g., 'TR'). */
  listCities(countryCode: string): Promise<{ data: City[] }> {
    return this.http.request('GET', '/cities', { query: { countryCode } });
  }

  /** List districts for a country + city code. */
  listDistricts(countryCode: string, cityCode: string): Promise<{ data: District[] }> {
    return this.http.request('GET', '/districts', { query: { countryCode, cityCode } });
  }
}
