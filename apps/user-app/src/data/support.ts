export type SupportBusiness = 'EXPRESS' | 'ERRAND' | 'RIDE' | 'HOTEL';
export type SupportChannel = 'ai' | 'human';
export type AgentStatus = 'online' | 'offline';

export interface SupportBusinessOption {
  type: SupportBusiness;
  titleKey: string;
  descKey: string;
  icon: string;
}

export interface SupportQrItem {
  id: 'wechat' | 'telegram' | 'whatsapp';
  labelKey: string;
  /** Placeholder or CMS-replaceable image URL */
  imageUrl: string;
}

/** CMS-replaceable social QR placeholders (admin can swap URLs later). */
export const SUPPORT_QR_ITEMS: SupportQrItem[] = [
  {
    id: 'wechat',
    labelKey: 'support.qr.wechat',
    imageUrl: 'https://via.placeholder.com/160x160.png?text=WeChat',
  },
  {
    id: 'telegram',
    labelKey: 'support.qr.telegram',
    imageUrl: 'https://via.placeholder.com/160x160.png?text=Telegram',
  },
  {
    id: 'whatsapp',
    labelKey: 'support.qr.whatsapp',
    imageUrl: 'https://via.placeholder.com/160x160.png?text=WhatsApp',
  },
];

export const SUPPORT_BUSINESSES: SupportBusinessOption[] = [
  { type: 'EXPRESS', titleKey: 'support.biz.express', descKey: 'support.biz.expressDesc', icon: 'send' },
  { type: 'ERRAND', titleKey: 'support.biz.errand', descKey: 'support.biz.errandDesc', icon: 'zap' },
  { type: 'RIDE', titleKey: 'support.biz.ride', descKey: 'support.biz.rideDesc', icon: 'car' },
  { type: 'HOTEL', titleKey: 'support.biz.hotel', descKey: 'support.biz.hotelDesc', icon: 'hotel' },
];

export function openSupportChat(
  business: SupportBusiness,
  channel: SupportChannel = 'ai',
  order?: { orderId?: string; orderNo?: string; orderStatus?: string },
): void {
  const q = new URLSearchParams({
    business,
    channel,
    ...(order?.orderId ? { orderId: order.orderId } : {}),
    ...(order?.orderNo ? { orderNo: order.orderNo } : {}),
    ...(order?.orderStatus ? { orderStatus: order.orderStatus } : {}),
  });
  uni.navigateTo({ url: `/pages/support/chat?${q.toString()}` });
}
