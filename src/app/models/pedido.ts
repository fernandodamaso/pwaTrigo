import { Base } from "./base";

export class pedidoData extends Base {
  Reference: string;
  ShortReference: string;
  Customer: Customer;
  scheduled: boolean;
  scheduledStart?: any;
  scheduledEnd?: any;
  status_pedido: StatusPedido[];
  Shipping: Shipping;
  Items: Item[];
  SubTotal: number;
  PriceDiscount: number;
  TotalPrice: number;
  packingCost: number;
  usedCashback: number;
  ExternalCode: string;
  CreatedAt: string;
  numero: string;
  deliveryFee: number;
  ShopId: number;
  idMarca: number;
  idOrigem: number;
  shippingMethod: shippingMethod;
  DtVenda: String;
}

export class Customer extends Base {
  Id: string;
  Phone: string;
  Email: string;
  Document: string;
  TaxPayerIdentificationNumber: string;
  IdCosmos: number;
  IdOracle: number;
}

export class StatusPedido {
  status: string;
  data: string;
  icone: string;
}

export class Shipping {
  addressId: number;
  formattedAddress: string;
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  streetName: string;
  streetNumber: number;
  postalCode: string;
  complement: string;
  googlePlaceId: string;
}

export class SubItem {
  id: any;
  Name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  discount: number;
  addition: number;
  externalCode: string;
  NM_CUSTOM: string;
  ID_CUSTOM_SEQ: string;
  internalCode: string;
  SKU: string;
  IC_TIP_DSC_PRO?: any;
}

export class Item {
  Quantity: number;
  Price: number;
  SubItemsPrice: number;
  TotalPrice: number;
  Discount: number;
  Addition: number;
  Index: number;
  Name: string;
  InternalCode: string;
  ExternalCode: string;
  SKU: string;
  AddedOn: string;
  subItems: SubItem[];
}
export class shippingMethod {
  id: string;
  Name: string;
  minTime: number;
  maxTime: number;
  EstimatedDelivery: string;
  ExternalCode: string;
  mode: string;
}
