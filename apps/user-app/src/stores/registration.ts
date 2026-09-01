import type { RegisterInput } from '@express-platform/shared-types';

export type PendingRegistration = Omit<RegisterInput, 'verificationToken'> & { mockCode?: string };

let pendingRegistration: PendingRegistration | null = null;

export function setPendingRegistration(value: PendingRegistration | null): void {
  pendingRegistration = value;
}

export function getPendingRegistration(): PendingRegistration | null {
  return pendingRegistration;
}
