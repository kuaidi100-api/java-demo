/** Lightweight analytics hooks for Wave-1 lifestyle modules. */
type TrackPayload = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, payload: TrackPayload = {}): void {
  try {
    // Placeholder for future SDK; keep console in non-production builds only.
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('[track]', event, payload);
    }
  } catch {
    // ignore
  }
}
