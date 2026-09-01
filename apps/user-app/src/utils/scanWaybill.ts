/** Scan / normalize express waybill barcodes (1D + QR). */

export function normalizeWaybillCode(raw: string): string {
  const text = String(raw || '').trim();
  if (!text) return '';

  try {
    const url = new URL(text);
    const fromQuery =
      url.searchParams.get('no') ||
      url.searchParams.get('nu') ||
      url.searchParams.get('mailNo') ||
      url.searchParams.get('trackingNo') ||
      url.searchParams.get('tracking_number');
    if (fromQuery?.trim()) return fromQuery.trim().toUpperCase();
  } catch {
    /* not a URL */
  }

  const compact = text.replace(/\s+/g, '');
  const match = compact.match(/[A-Za-z0-9][A-Za-z0-9\-_]{7,39}/);
  return (match?.[0] || compact).toUpperCase();
}

type ScanOk = { ok: true; code: string; scanType?: string };
type ScanFail = { ok: false; reason: 'cancel' | 'unsupported' | 'empty' | 'error'; message?: string };
export type ScanWaybillResult = ScanOk | ScanFail;

function isH5(): boolean {
  const platform = String((import.meta as { env?: { UNI_PLATFORM?: string } }).env?.UNI_PLATFORM || '');
  if (platform) return platform === 'h5';
  return typeof document !== 'undefined' && !(window as { plus?: unknown }).plus;
}

async function scanWithBarcodeDetector(): Promise<ScanWaybillResult> {
  const Detector = (window as unknown as {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string; format?: string }>>;
    };
  }).BarcodeDetector;

  if (!Detector) return { ok: false, reason: 'unsupported' };

  const formats = [
    'code_128',
    'code_39',
    'code_93',
    'codabar',
    'ean_13',
    'ean_8',
    'upc_a',
    'upc_e',
    'itf',
    'qr_code',
    'data_matrix',
  ];

  return await new Promise((resolve) => {
    uni.chooseImage({
      count: 1,
      sourceType: ['camera', 'album'],
      sizeType: ['compressed'],
      success: async (res) => {
        const path = res.tempFilePaths?.[0];
        if (!path) {
          resolve({ ok: false, reason: 'empty' });
          return;
        }
        try {
          const blob = await (await fetch(path)).blob();
          const bitmap = await createImageBitmap(blob);
          const detector = new Detector({ formats });
          const codes = await detector.detect(bitmap);
          bitmap.close?.();
          const hit = codes.find((item) => item.rawValue?.trim());
          const code = normalizeWaybillCode(hit?.rawValue || '');
          if (!code) {
            resolve({ ok: false, reason: 'empty', message: '未识别到运单条码' });
            return;
          }
          resolve({ ok: true, code, scanType: hit?.format });
        } catch (cause) {
          resolve({
            ok: false,
            reason: 'error',
            message: cause instanceof Error ? cause.message : '扫码失败',
          });
        }
      },
      fail: () => resolve({ ok: false, reason: 'cancel' }),
    });
  });
}

function scanWithUniApi(): Promise<ScanWaybillResult> {
  return new Promise((resolve) => {
    uni.scanCode({
      // Express face sheets are usually 1D barcodes; QR is secondary
      scanType: ['barCode', 'qrCode'],
      onlyFromCamera: false,
      success: (res) => {
        const code = normalizeWaybillCode(String(res.result || ''));
        if (!code) {
          resolve({ ok: false, reason: 'empty', message: '未识别到运单号' });
          return;
        }
        resolve({ ok: true, code, scanType: String(res.scanType || '') });
      },
      fail: (err) => {
        const msg = String((err as { errMsg?: string })?.errMsg || '');
        if (/cancel/i.test(msg)) resolve({ ok: false, reason: 'cancel' });
        else resolve({ ok: false, reason: 'error', message: msg || '扫码失败' });
      },
    });
  });
}

/** Prefer barcode (运单条码); fall back to H5 BarcodeDetector / photo. */
export async function scanWaybillCode(): Promise<ScanWaybillResult> {
  if (isH5()) {
    const viaDetector = await scanWithBarcodeDetector();
    if (viaDetector.ok || viaDetector.reason === 'cancel') return viaDetector;
    // Last resort: native API may exist in some WebView shells
    try {
      return await scanWithUniApi();
    } catch {
      return viaDetector.reason === 'unsupported'
        ? { ok: false, reason: 'unsupported', message: '当前浏览器暂不支持扫运单条码，请手动输入' }
        : viaDetector;
    }
  }
  return scanWithUniApi();
}
