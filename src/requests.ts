// Typed request bodies for key endpoints
import { Address } from './models/index.js';

export interface CreateAddressRequest {
  name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  countryCode: string;
  cityName: string;
  cityCode: string;
  districtName: string;
  districtID: number | string;
  zip: string;
  shortName?: string;
  isRecipientAddress?: boolean;
}

export type RecipientSpecifier =
  | { recipientAddressID: string }
  | { recipientAddress: Address };

export interface CreateShipmentRequestBase {
  sourceCode: string; // "API"
  senderAddressID: string;
  length?: number; width?: number; height?: number; distanceUnit?: string;
  weight?: number; massUnit?: string;
  providerServiceCode?: string; // optional direct provider
  test?: boolean; // per-shipment test flag
}

export type CreateShipmentRequest = CreateShipmentRequestBase & RecipientSpecifier;

export interface UpdatePackageRequest {
  height?: number; width?: number; length?: number; distanceUnit?: string; weight?: number; massUnit?: string;
}

export interface CreateReturnShipmentRequest {
  isReturn?: boolean; // forced true by SDK
  willAccept: boolean;
  providerServiceCode: string;
  count: number;
  senderAddress: Pick<Address, 'name' | 'phone' | 'address1' | 'countryCode' | 'cityCode' | 'districtName'>;
}
