// Auto-generated from openapi.yaml

/** Address model */
export interface Address {
  address1?: string;
  address2?: string;
  city?: City;
  cityCode?: string;
  cityName?: string;
  countryCode?: string;
  countryName?: string;
  createdAt?: string;
  district?: District;
  districtID?: string | number;
  districtName?: string;
  email?: string;
  id?: string;
  isActive?: boolean;
  isDefaultReturnAddress?: boolean;
  isDefaultSenderAddress?: boolean;
  isInvoiceAddress?: boolean;
  isRecipientAddress?: boolean;
  metadata?: JSONContent;
  name?: string;
  owner?: string;
  phone?: string;
  shortName?: string;
  source?: string;
  state?: string;
  streetID?: string;
  streetName?: string;
  test?: boolean;
  updatedAt?: string;
  zip?: string;
}

/** City model */
export interface City {
  areaCode?: string;
  cityCode?: string;
  countryCode?: string;
  /** Model */
  name?: string;
}

/** DbStringArray model */
export interface DbStringArray {
}

/** District model */
export interface District {
  cityCode?: string;
  countryCode?: string;
  districtID?: string | number;
  /** Model */
  name?: string;
  regionCode?: string;
}

// Duration was previously modeled as an object; the API returns an integer timestamp for duration.

/** Item model */
export interface Item {
  countryOfOrigin?: string;
  createdAt?: string;
  currency?: string;
  currencyLocal?: string;
  id?: string;
  massUnit?: string;
  maxDeliveryTime?: string;
  maxShipTime?: string;
  owner?: string;
  quantity?: string | number;
  sku?: string;
  test?: boolean;
  title?: string;
  totalPrice?: string;
  totalPriceLocal?: string;
  unitPrice?: string;
  unitPriceLocal?: string;
  unitWeight?: string;
  updatedAt?: string;
  variantTitle?: string;
}

/** JSONContent model */
export interface JSONContent {
}

/** Offer model */
export interface Offer {
  amount?: string;
  amountLocal?: string;
  amountLocalOld?: string;
  amountLocalTax?: string;
  amountLocalVat?: string;
  amountOld?: string;
  amountTax?: string;
  amountVat?: string;
  averageEstimatedTime?: number;
  averageEstimatedTimeHumanReadible?: string;
  bonusBalance?: string;
  createdAt?: string;
  currency?: string;
  currencyLocal?: string;
  discountRate?: string;
  durationTerms?: string;
  estimatedArrivalTime?: string;
  id?: string;
  integrationType?: string;
  isAccepted?: boolean;
  isC2C?: boolean;
  isGlobal?: boolean;
  isMainOffer?: boolean;
  isProviderAccountOffer?: boolean;
  maxEstimatedTime?: number;
  minEstimatedTime?: number;
  owner?: string;
  predictedDeliveryTime?: string | number;
  providerAccountID?: string;
  providerAccountName?: string;
  providerAccountOwnerType?: string;
  providerCode?: string;
  providerServiceCode?: string;
  providerTotalAmount?: string;
  rating?: string | number;
  scheduleDate?: string;
  shipmentTime?: string;
  test?: boolean;
  totalAmount?: string;
  totalAmountLocal?: string;
  updatedAt?: string;
}

/** OfferList model */
export interface OfferList {
  allowOfferFallback?: boolean;
  cheapest?: Offer;
  createdAt?: string;
  fastest?: Offer;
  height?: string;
  itemIDs?: string[];
  length?: string;
  list?: Offer[];
  owner?: string;
  parcelIDs?: string[];
  parcelTemplateID?: string;
  percentageCompleted?: string | number;
  providerAccountIDs?: string[];
  providerCodes?: string[];
  providerServiceCodes?: string[];
  test?: boolean;
  totalOffersCompleted?: string | number;
  totalOffersRequested?: string | number;
  updatedAt?: string;
  weight?: string;
  width?: string;
}

/** Order model */
export interface Order {
  buyerShipmentMethod?: string;
  buyerShippingCost?: string;
  buyerShippingCostCurrency?: string;
  createdAt?: string;
  id?: string;
  itemIDs?: DbStringArray;
  merchantCode?: string;
  notes?: string;
  orderCode?: string;
  orderNumber?: string;
  orderStatus?: string;
  organizationID?: string;
  owner?: string;
  shipment?: Shipment;
  sourceCode?: string;
  sourceIdentifier?: string;
  test?: boolean;
  totalAmount?: string;
  totalAmountCurrency?: string;
  totalTax?: string;
  updatedAt?: string;
}

/** Parcel model */
export interface Parcel {
  amount?: string;
  amountLocal?: string;
  amountLocalOld?: string;
  amountLocalTax?: string;
  amountLocalVat?: string;
  amountOld?: string;
  amountTax?: string;
  amountVat?: string;
  barcode?: string;
  bonusBalance?: string;
  commercialInvoiceUrl?: string;
  createdAt?: string;
  currency?: string;
  currencyLocal?: string;
  customsDeclaration?: string;
  /** Desi of parcel */
  desi?: string;
  discountRate?: string;
  /** Distance unit of parcel */
  distanceUnit?: string;
  eta?: string;
  extra?: JSONContent;
  /** Height of parcel */
  height?: string;
  hidePackageContentOnTag?: boolean;
  id?: string;
  invoiceGenerated?: boolean;
  invoiceID?: string;
  isMainParcel?: boolean;
  itemIDs?: string[];
  labelFileType?: string;
  labelURL?: string;
  /** Length of parcel */
  length?: string;
  /** Weight unit of parcel */
  massUnit?: string;
  metadata?: JSONContent;
  /** Meta string to add additional info on your shipment/parcel */
  metadataText?: string;
  oldDesi?: string;
  oldWeight?: string;
  owner?: string;
  parcelReferenceCode?: string;
  /** Instead of setting parcel size manually, you can set this to a predefined Parcel Template */
  parcelTemplateID?: string;
  productPaymentOnDelivery?: boolean;
  providerTotalAmount?: string;
  qrCodeUrl?: string;
  refundInvoiceID?: string;
  responsiveLabelURL?: string;
  shipmentDate?: string;
  shipmentID?: string;
  stateCode?: string;
  template?: string;
  test?: boolean;
  totalAmount?: string;
  totalAmountLocal?: string;
  /** Tracking number */
  trackingNumber?: string;
  trackingStatus?: Tracking;
  trackingUrl?: string;
  updatedAt?: string;
  /** If true, auto calculates total parcel size using the size of items */
  useDimensionsOfItems?: boolean;
  /** If true, auto calculates total parcel weight using the weight of items */
  useWeightOfItems?: boolean;
  /** Weight of parcel */
  weight?: string;
  /** Width of parcel */
  width?: string;
}

/** Shipment model */
export interface Shipment {
  acceptedOffer?: Offer;
  acceptedOfferID?: string;
  amount?: string;
  amountLocal?: string;
  amountLocalOld?: string;
  amountLocalTax?: string;
  amountLocalVat?: string;
  amountOld?: string;
  amountTax?: string;
  amountVat?: string;
  barcode?: string;
  bonusBalance?: string;
  buyerNote?: string;
  cancelDate?: string;
  categoryCode?: string;
  commercialInvoiceUrl?: string;
  createReturnLabel?: boolean;
  createdAt?: string;
  currency?: string;
  currencyLocal?: string;
  customsDeclaration?: string;
  /** Desi of parcel */
  desi?: string;
  discountRate?: string;
  /** Distance unit of parcel */
  distanceUnit?: string;
  enableAutomation?: boolean;
  eta?: string;
  extraParcels?: Parcel[];
  hasError?: boolean;
  /** Height of parcel */
  height?: string;
  hidePackageContentOnTag?: boolean;
  id?: string;
  invoiceGenerated?: boolean;
  invoiceID?: string;
  isRecipientSmsActivated?: boolean;
  isReturn?: boolean;
  isReturned?: boolean;
  isTrackingOnly?: boolean;
  items?: Item[];
  labelFileType?: string;
  labelURL?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  /** Length of parcel */
  length?: string;
  /** Weight unit of parcel */
  massUnit?: string;
  metadata?: JSONContent;
  /** Meta string to add additional info on your shipment/parcel */
  metadataText?: string;
  offers?: OfferList;
  oldDesi?: string;
  oldWeight?: string;
  order?: Order;
  orderID?: string;
  organizationShipmentID?: string | number;
  owner?: string;
  packageAcceptedAt?: string;
  /** Instead of setting parcel size manually, you can set this to a predefined Parcel Template */
  parcelTemplateID?: string;
  productPaymentOnDelivery?: boolean;
  providerAccountID?: string;
  providerAccountIDs?: string[];
  providerBranchName?: string;
  providerCode?: string;
  providerCodes?: string[];
  providerInvoiceNo?: string;
  providerReceiptNo?: string;
  providerSerialNo?: string;
  providerServiceCode?: string;
  providerServiceCodes?: string[];
  providerTotalAmount?: string;
  qrCodeUrl?: string;
  recipientAddress?: Address;
  recipientAddressID?: string;
  refundInvoiceID?: string;
  responsiveLabelURL?: string;
  returnAddressID?: string;
  sellerNote?: string;
  senderAddress?: Address;
  senderAddressID?: string;
  shipmentDate?: string;
  statusCode?: string;
  tags?: string[];
  tenantId?: string;
  test?: boolean;
  totalAmount?: string;
  totalAmountLocal?: string;
  /** Tracking number */
  trackingNumber?: string;
  trackingStatus?: Tracking;
  trackingUrl?: string;
  updatedAt?: string;
  /** If true, auto calculates total parcel size using the size of items */
  useDimensionsOfItems?: boolean;
  /** If true, auto calculates total parcel weight using the weight of items */
  useWeightOfItems?: boolean;
  /** Weight of parcel */
  weight?: string;
  /** Width of parcel */
  width?: string;
}

/** ShipmentResponse model */
export interface ShipmentResponse {
  additionalMessage?: string;
  code?: string;
  data?: Shipment;
  message?: string;
  result?: boolean;
}

/** Tracking model */
export interface Tracking {
  createdAt?: string;
  hash?: string;
  id?: string;
  locationLat?: string | number;
  locationLng?: string | number;
  locationName?: string;
  owner?: string;
  statusDate?: string;
  statusDetails?: string;
  test?: boolean;
  trackingStatusCode?: string;
  trackingSubStatusCode?: string;
  updatedAt?: string;
}
