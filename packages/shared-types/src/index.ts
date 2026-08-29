export enum PrincipalType {
  USER = 'USER',
  COURIER = 'COURIER',
  ADMINISTRATOR = 'ADMINISTRATOR',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  PENDING_DISPATCH = 'PENDING_DISPATCH',
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  ACCEPTED = 'ACCEPTED',
  PICKING_UP = 'PICKING_UP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXCEPTION = 'EXCEPTION',
}

export enum OrderAction {
  SUBMIT = 'SUBMIT',
  CONFIRM = 'CONFIRM',
  DISPATCH = 'DISPATCH',
  ACCEPT = 'ACCEPT',
  START_PICKUP = 'START_PICKUP',
  CONFIRM_PICKUP = 'CONFIRM_PICKUP',
  START_TRANSIT = 'START_TRANSIT',
  CONFIRM_DELIVERY = 'CONFIRM_DELIVERY',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  REPORT_EXCEPTION = 'REPORT_EXCEPTION',
}

export enum OrderServiceType {
  EXPRESS = 'EXPRESS',
  PICKUP = 'PICKUP',
  INTRACITY = 'INTRACITY',
}

export enum ItemType {
  DOCUMENT = 'DOCUMENT',
  CLOTHING = 'CLOTHING',
  FOOD = 'FOOD',
  DIGITAL = 'DIGITAL',
  DAILY_NECESSITIES = 'DAILY_NECESSITIES',
  OTHER = 'OTHER',
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: { code: number | string; message: string | string[] };
  path: string;
  requestId: string;
  timestamp: string;
}

export interface MockEnvironmentState {
  enabled: boolean;
  label: '模拟环境' | '真实环境';
}

export interface AuthSubject {
  id: string;
  type: PrincipalType;
  displayName?: string;
  identifier?: string;
  roles: string[];
  permissions: string[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  subject: AuthSubject;
  environment: MockEnvironmentState;
}

export interface LoginInput {
  subjectType: PrincipalType;
  identifier: string;
  password: string;
}

export interface AddressInput {
  contactName: string;
  phone: string;
  countryCode?: string;
  country: string;
  province?: string;
  city: string;
  district?: string;
  detail: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressBookItem extends Omit<AddressInput, 'phone'> {
  id: string;
  label?: string | null;
  phone: string;
  isDefaultSender: boolean;
  isDefaultReceiver: boolean;
}

export interface CreateOrderInput {
  serviceType: OrderServiceType;
  sender?: AddressInput;
  recipient?: AddressInput;
  senderAddressId?: string;
  recipientAddressId?: string;
  item: {
    type: ItemType;
    name: string;
    quantity: number;
    weightKg: number;
    notes?: string;
  };
  scheduledPickupAt?: string;
  remark?: string;
}

export interface EstimateInput {
  serviceType: OrderServiceType;
  weightKg: number;
  distanceKm?: number;
}

export interface EstimateResult {
  amount: number;
  currency: string;
  ruleId: string | null;
  isMock: boolean;
  notice: string;
}

export interface OrderSummary {
  id: string;
  orderNo: string;
  serviceType: OrderServiceType;
  status: OrderStatus;
  estimatedFee: number | string;
  currency: string;
  isMock: boolean;
  scheduledPickupAt: string | null;
  createdAt: string;
  shipment: {
    shipmentNo: string;
    providerCode: string;
    status: string;
    isMock: boolean;
  } | null;
}

export interface OrderAddress extends Omit<AddressInput, 'phone'> {
  id: string;
  type: 'SENDER' | 'RECIPIENT';
  phone: string;
}

export interface OrderItem {
  id: string;
  type: ItemType;
  name: string;
  quantity: number;
  weightKg: number | string;
  notes: string | null;
}

export interface OrderStatusLog {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  operatorType: PrincipalType;
  reason: string | null;
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  status: OrderStatus;
  description: string;
  occurredAt: string;
}

export interface OrderDetail extends Omit<OrderSummary, 'shipment'> {
  courierId: string | null;
  remark: string | null;
  addresses: OrderAddress[];
  items: OrderItem[];
  statusLogs: OrderStatusLog[];
  shipment: (NonNullable<OrderSummary['shipment']> & { trackingEvents: TrackingEvent[] }) | null;
  task: { id: string; courierId: string | null; status: string } | null;
  environment: MockEnvironmentState;
}

export interface OrderActionInput {
  action: OrderAction;
  reason?: string;
  courierId?: string;
}

export interface CourierOption {
  id: string;
  displayName: string;
  phone: string;
  accountStatus: string;
  workStatus: string;
  activeOrderCount: number;
}

export interface AdminOverview {
  totalOrders: number;
  pendingDispatch: number;
  pendingAcceptance: number;
  inProgress: number;
  completed: number;
  exception: number;
  activeCouriers: number;
  mockEnvironment: true;
}
