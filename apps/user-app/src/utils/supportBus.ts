import type { SupportBusiness } from '../data/support';

export type SupportOpenPayload = {
  business?: SupportBusiness;
  /** When true, skip business picker (page-level contact). */
  locked?: boolean;
};

const EVENT = 'km-support-open';

export function openSupportSheet(payload: SupportOpenPayload = {}): void {
  uni.$emit(EVENT, payload);
}

export function onSupportSheetOpen(handler: (payload: SupportOpenPayload) => void): void {
  uni.$on(EVENT, handler);
}

export function offSupportSheetOpen(handler: (payload: SupportOpenPayload) => void): void {
  uni.$off(EVENT, handler);
}
