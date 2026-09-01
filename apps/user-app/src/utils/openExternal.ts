/** Open shopping mall / external URL (H5 + App). */

export function openExternalUrl(url: string, appScheme?: string): void {
  const target = String(url || '').trim();
  if (!target) return;

  const plusRuntime = (globalThis as {
    plus?: { runtime?: { openURL?: (u: string, fail?: () => void) => void } };
  }).plus?.runtime;

  if (plusRuntime?.openURL) {
    if (appScheme) {
      plusRuntime.openURL(appScheme, () => plusRuntime.openURL?.(target));
      return;
    }
    plusRuntime.openURL(target);
    return;
  }

  if (typeof window !== 'undefined') {
    const opened = window.open(target, '_blank', 'noopener,noreferrer');
    if (opened) return;
    // Popup blocked — navigate current tab
    window.location.href = target;
    return;
  }

  uni.setClipboardData({
    data: target,
    success: () => uni.showToast({ title: '链接已复制，请到浏览器打开', icon: 'none' }),
  });
}
