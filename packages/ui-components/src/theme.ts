import { computed, ref } from 'vue';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'km.theme';

/** Single shared state — do not duplicate this module via alternate import paths. */
export const theme = ref<ThemeMode>('light');

let persist: ((mode: ThemeMode) => void) | undefined;
let bound = false;

function applyDocumentTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.classList.toggle('km-dark', mode === 'dark');
  root.style.colorScheme = mode;

  const body = document.body;
  if (body) {
    body.setAttribute('data-theme', mode);
    body.classList.toggle('km-dark', mode === 'dark');
  }

  // Only stamp #app — avoid mutating uni-page shells mid route animation
  const app = document.getElementById('app');
  if (app) {
    app.setAttribute('data-theme', mode);
    app.classList.toggle('km-dark', mode === 'dark');
  }
}

/** Re-stamp theme onto freshly mounted uni page shells after route changes. */
export function syncDocumentTheme(): void {
  applyDocumentTheme(theme.value);
}

export function bindThemeStorage(save: (mode: ThemeMode) => void, initial?: string): void {
  persist = save;
  const next = initial === 'dark' || initial === 'light' ? initial : 'light';
  // Only overwrite UI state on first bind; later calls only refresh persist fn
  // (uni onLaunch may re-enter after user already toggled).
  if (!bound) {
    theme.value = next;
    applyDocumentTheme(next);
    bound = true;
    return;
  }
  // Re-apply current theme to DOM (page remount / H5 navigation)
  applyDocumentTheme(theme.value);
}

export function setTheme(mode: ThemeMode): void {
  if (mode !== 'light' && mode !== 'dark') return;
  theme.value = mode;
  try {
    persist?.(mode);
  } catch {
    /* storage may be unavailable */
  }
  applyDocumentTheme(mode);
}

export function toggleTheme(): void {
  setTheme(theme.value === 'dark' ? 'light' : 'dark');
}

export const isDark = computed(() => theme.value === 'dark');

/** Uni-app / H5 bootstrap helper used by apps */
export function initThemeFromStorage(get: () => string, set: (mode: ThemeMode) => void): void {
  let saved = '';
  try {
    saved = String(get() || '');
  } catch {
    saved = '';
  }
  bindThemeStorage(set, saved);
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
