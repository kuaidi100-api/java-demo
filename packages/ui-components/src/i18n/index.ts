import { ref } from 'vue';
import { messages, type MessageKey } from './messages.js';

export const locales = ['zh-CN', 'zh-Hant', 'vi', 'en', 'lo', 'th', 'my', 'ms'] as const;
export type Locale = (typeof locales)[number];

export const localeOptions: { code: Locale; native: string; abbr: string }[] = [
  { code: 'zh-CN', native: '简体中文', abbr: '中' },
  { code: 'zh-Hant', native: '繁體中文', abbr: '繁' },
  { code: 'vi', native: 'Tiếng Việt', abbr: 'VI' },
  { code: 'en', native: 'English', abbr: 'EN' },
  { code: 'lo', native: 'ລາວ', abbr: 'LO' },
  { code: 'th', native: 'ไทย', abbr: 'TH' },
  { code: 'my', native: 'မြန်မာ', abbr: 'MY' },
  { code: 'ms', native: 'Bahasa Melayu', abbr: 'MS' },
];

export const locale = ref<Locale>('zh-CN');
let persist: ((code: Locale) => void) | undefined;

export function localeAbbr(code?: Locale): string {
  const resolved = code ?? locale.value;
  return localeOptions.find((item) => item.code === resolved)?.abbr ?? resolved.slice(0, 2).toUpperCase();
}

const htmlLang: Record<Locale, string> = {
  'zh-CN': 'zh-CN',
  'zh-Hant': 'zh-Hant',
  vi: 'vi',
  en: 'en',
  lo: 'lo',
  th: 'th',
  my: 'my',
  ms: 'ms',
};

function normalizeLocale(code: string | undefined | null): Locale | null {
  if (!code) return null;
  if (code === 'yue') return 'vi';
  if (locales.includes(code as Locale)) return code as Locale;
  return null;
}

export function bindLocaleStorage(save: (code: Locale) => void, initial?: string): void {
  persist = save;
  const next = normalizeLocale(initial);
  if (next) {
    locale.value = next;
    applyDocumentLang();
  }
}

export function setLocale(code: Locale): void {
  if (!locales.includes(code)) return;
  locale.value = code;
  persist?.(code);
  applyDocumentLang();
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  void locale.value;
  const table = messages[locale.value] ?? messages['zh-CN'];
  let text = table[key] ?? messages['zh-CN'][key] ?? String(key);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

function applyDocumentLang(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = htmlLang[locale.value];
}

export { messages };
export type { MessageKey };
