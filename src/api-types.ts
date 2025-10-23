// Hand-authored API types to maintain strong typing when OpenAPI lacks some definitions

export interface ProviderAccount {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  providerCode?: string;
  username?: string;
  name?: string;
  isActive?: boolean;
  parameters?: Record<string, unknown>;
  version?: number;
  isC2C?: boolean;
  integrationType?: string;
  labelFileType?: string;
  sharable?: boolean;
  isPublic?: boolean;
  isDynamicPrice?: boolean;
  priceUpdatedAt?: string;
}

export interface ProviderAccountRequest {
  username: string;
  password?: string;
  name: string;
  providerCode: string;
  version: number;
  isActive: boolean;
  parameters?: Record<string, unknown>;
  isPublic: boolean;
  sharable: boolean;
  isDynamicPrice: boolean;
}

export interface ParcelTemplate {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  length?: string;
  width?: string;
  height?: string;
  desi?: string;
  oldDesi?: string;
  distanceUnit?: string;
  weight?: string;
  oldWeight?: string;
  massUnit?: string;
  isActive?: boolean;
  name?: string;
  LanguageCode?: string;
}

export interface OrganizationBalance {
  result?: boolean;
  additionalMessage?: string;
  data?: string; // balance
  debt?: string; // debt
}

export interface Transaction {
  id: string;
  isPayed?: boolean;
  offerID: string;
  shipment?: import('./models/index.js').Shipment;
}

