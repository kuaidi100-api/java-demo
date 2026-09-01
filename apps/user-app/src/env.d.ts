/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_PROVIDER_MODE?: string;
  /** Optional rider GPS API root, e.g. https://kapokstar.com/api/v1 */
  readonly VITE_RIDER_GPS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
