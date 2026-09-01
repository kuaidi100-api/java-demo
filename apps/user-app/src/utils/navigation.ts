export function backOrHome(): void {
  if (getCurrentPages().length > 1) uni.navigateBack();
  else uni.reLaunch({ url: '/pages/home/index' });
}

export function openPrimaryTab(key: string): void {
  const routes: Record<string, string> = {
    home: '/pages/home/index',
    tracking: '/pages/tracking/index',
    flash: '/pages/flash/index',
    orders: '/pages/orders/index',
    profile: '/pages/profile/index',
  };
  const url = routes[key];
  if (!url) return;
  if (key === 'home') uni.reLaunch({ url });
  else uni.navigateTo({ url });
}
