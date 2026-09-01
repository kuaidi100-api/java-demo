import { bindLocaleStorage, locale, setLocale, t, type Locale } from '@express-platform/ui-components/mobile/i18n.ts';

const STORAGE_KEY = 'km.locale';

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

export { locale, setLocale, t };
export type { Locale };
