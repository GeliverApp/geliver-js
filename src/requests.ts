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
  districtID?: number | string;
  zip: string;
  shortName?: string;
  isRecipientAddress?: boolean;
}

export type RecipientSpecifier =
  | { recipientAddressID: string }
  | { recipientAddress: Address };

export interface CreateShipmentRequestBase {
  senderAddressID: string;
  length?: string; width?: string; height?: string; distanceUnit?: string;
  weight?: string; massUnit?: string;
  providerServiceCode?: string; // optional direct provider
  test?: boolean; // per-shipment test flag
  order?: {
    sourceCode?: string; // defaulted to "API" by SDK when order is present
    sourceIdentifier?: string;
    orderNumber: string;
    totalAmount?: string | number;
    totalAmountCurrency?: string;
  };
}

export type CreateShipmentRequest = CreateShipmentRequestBase & RecipientSpecifier;

export interface UpdatePackageRequest {
  height?: string; width?: string; length?: string; distanceUnit?: string; weight?: string; massUnit?: string;
}

export interface CreateReturnShipmentRequest {
  isReturn?: boolean; // forced true by SDK
  willAccept: boolean;
  providerServiceCode?: string; // optional, defaults to original shipment provider
  count: number;
  // Optional: backend will default to original shipment's recipient address; set to override
  senderAddress?: Pick<Address, 'name' | 'phone' | 'address1' | 'countryCode' | 'cityCode' | 'districtName'>;
}
