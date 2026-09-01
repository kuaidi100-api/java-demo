import {
  bindLocaleStorage,
  locale,
  localeAbbr,
  localeOptions,
  setLocale,
  t,
  type Locale,
  type MessageKey,
} from '@express-platform/ui-components/mobile/i18n.ts';
import { initThemeFromStorage, type ThemeMode } from '@express-platform/ui-components/theme';

const STORAGE_KEY = 'km.locale';
const THEME_KEY = 'km.theme';

export function initAppLocale(): void {
  let saved = '';
  try {
    saved = String(uni.getStorageSync(STORAGE_KEY) || '');
  } catch {
    saved = '';
  }
  bindLocaleStorage((code) => {
    uni.setStorageSync(STORAGE_KEY, code);
  }, saved);
}

export function initAppTheme(): void {
  initThemeFromStorage(
    () => String(uni.getStorageSync(THEME_KEY) || ''),
    (mode: ThemeMode) => {
      uni.setStorageSync(THEME_KEY, mode);
    },
  );
}

export { locale, localeAbbr, localeOptions, setLocale, t };
export type { Locale, MessageKey };
