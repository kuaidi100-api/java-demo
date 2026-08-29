export interface ShipmentDraft {
  orderNo: string;
  senderCity: string;
  recipientCity: string;
  weightKg: number;
}

export interface ShipmentResult {
  providerCode: string;
  shipmentNo: string;
  providerRef?: string;
  isMock: boolean;
  message: string;
}

export interface LogisticsProvider {
  createShipment(draft: ShipmentDraft): Promise<ShipmentResult>;
}

export interface MapProvider {
  estimateRoute(input: {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
  }): Promise<{ distanceKm: number; durationMinutes: number; isMock: boolean }>;
}

export interface SmsProvider {
  send(input: { phone: string; template: string; variables: Record<string, string> }): Promise<{ accepted: boolean; isMock: boolean }>;
}

export interface StorageProvider {
  save(input: { content: Buffer; mimeType: string; originalName: string }): Promise<{ storageKey: string; sizeBytes: number }>;
}

export interface PaymentProvider {
  createPayment(): Promise<never>;
}

export interface NotificationProvider {
  send(input: { recipientId: string; title: string; content: string }): Promise<{ accepted: boolean; isMock: boolean }>;
}

export const LOGISTICS_PROVIDER = Symbol('LOGISTICS_PROVIDER');
export const MAP_PROVIDER = Symbol('MAP_PROVIDER');
export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
export const NOTIFICATION_PROVIDER = Symbol('NOTIFICATION_PROVIDER');
