export interface HotelRoomType {
  id: string;
  name: string;
  beds: string;
  area: string;
  capacity: number;
  priceHint: number;
  tags: string[];
  features: string[];
  summary: string;
  /** 3–5 张轮播图（体积压缩后的 listing 图） */
  images: string[];
}

export interface HotelBrand {
  id: string;
  name: string;
  tags: string[];
  summary: string;
  coverGradient: string;
  /** 列表/详情封面实景图（可选） */
  coverImage?: string;
  videoUrl?: string;
  location: string;
  featured: boolean;
  /** garden=花园暖调 / star=都市冷调 */
  photoTheme: 'garden' | 'star';
  roomTypes: HotelRoomType[];
}

/** 统一 5 种房型：大床房 / 双床房 / 贵宾商务大床房 / 商务套房 / VIP商务套房 */
const ROOM_SPECS: Array<{
  key: string;
  name: string;
  beds: string;
  area: string;
  capacity: number;
  tags: string[];
  features: string[];
  summary: string;
  shotCount: number;
}> = [
  {
    key: 'king',
    name: '大床房',
    beds: '大床 1.8m',
    area: '28–32㎡',
    capacity: 2,
    tags: ['热门', '情侣优选'],
    features: ['独立卫浴', '高速Wi‑Fi', '智能客房'],
    summary: '舒适大床，适合双人短住与周末出行。',
    shotCount: 3,
  },
  {
    key: 'twin',
    name: '双床房',
    beds: '双床 1.2m×2',
    area: '30–34㎡',
    capacity: 2,
    tags: ['出差首选', '可加床'],
    features: ['独立卫浴', '书桌', '高速Wi‑Fi'],
    summary: '两张单人床，适合同事同行或亲友分床休息。',
    shotCount: 3,
  },
  {
    key: 'biz',
    name: '贵宾商务大床房',
    beds: '大床 1.8–2.0m',
    area: '38–42㎡',
    capacity: 2,
    tags: ['商务', '礼遇'],
    features: ['办公桌', '迷你吧', '浴缸', '景观窗'],
    summary: '加大空间与商务配套，兼顾会客与夜间休息。',
    shotCount: 3,
  },
  {
    key: 'suite',
    name: '商务套房',
    beds: '大床 2.0m',
    area: '52–58㎡',
    capacity: 3,
    tags: ['套房', '会客区'],
    features: ['独立客厅', '行政礼遇', '浴缸', '双区动线'],
    summary: '卧室与会客区分离，适合商务洽谈与较长时间入住。',
    shotCount: 3,
  },
  {
    key: 'vip',
    name: 'VIP商务套房',
    beds: '大床 2.0m + 沙发床',
    area: '68–78㎡',
    capacity: 4,
    tags: ['VIP', '旗舰'],
    features: ['双卫', '会客厅', '行政管家', '欢迎礼遇'],
    summary: '旗舰套房配置，适合贵宾接待与高端商务旅居。',
    shotCount: 4,
  },
];

function roomImages(theme: 'garden' | 'star', key: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/static/hotels/rooms/${theme}/${key}-${i + 1}.jpg`);
}

function buildRooms(
  prefix: string,
  theme: 'garden' | 'star',
  prices: [number, number, number, number, number],
): HotelRoomType[] {
  return ROOM_SPECS.map((spec, index) => ({
    id: `${prefix}-${spec.key}`,
    name: spec.name,
    beds: spec.beds,
    area: spec.area,
    capacity: spec.capacity,
    priceHint: prices[index],
    tags: spec.tags,
    features: spec.features,
    summary: spec.summary,
    images: roomImages(theme, spec.key, spec.shotCount),
  }));
}

export const HOTEL_BRANDS: HotelBrand[] = [
  {
    id: 'kapok-garden',
    name: '木棉花园',
    tags: ['官方推荐', '主推'],
    summary: '花园式院落与安静客房，适合家庭与长住休整。',
    coverGradient: 'linear-gradient(145deg,#2d4a3e,#5a8f6e)',
    coverImage: '/static/hotels/covers/kapok-garden.jpg',
    location: '金三角经济特区 · 花园区',
    featured: true,
    photoTheme: 'garden',
    roomTypes: buildRooms('kapok-garden', 'garden', [258, 288, 428, 598, 798]),
  },
  {
    id: 'kapok-star',
    name: '木棉之星',
    tags: ['官方推荐', '特区地标'],
    summary: '金三角核心区旗舰酒店，交通便利，适合商务与短途旅居。',
    coverGradient: 'linear-gradient(145deg,#1e3a5f,#3d7ea6)',
    coverImage: '/static/hotels/covers/kapok-star.jpg',
    location: '金三角经济特区 · 核心区',
    featured: true,
    photoTheme: 'star',
    roomTypes: buildRooms('kapok-star', 'star', [288, 318, 488, 688, 868]),
  },
  {
    id: 'wanguo',
    name: '万国公寓',
    tags: ['高层观景'],
    summary: '高层观景公寓，视野开阔，适合追求视野与空间的旅客。',
    coverGradient: 'linear-gradient(145deg,#3b2f55,#7a6bb5)',
    location: '金三角经济特区 · 滨江',
    featured: false,
    photoTheme: 'star',
    roomTypes: buildRooms('wanguo', 'star', [318, 348, 528, 728, 928]),
  },
  {
    id: 'taihe',
    name: '泰和公寓',
    tags: ['长住优选'],
    summary: '面向长住与项目驻场，配套齐全，性价比突出。',
    coverGradient: 'linear-gradient(145deg,#5c4033,#a67c52)',
    location: '金三角经济特区 · 生活区',
    featured: false,
    photoTheme: 'garden',
    roomTypes: buildRooms('taihe', 'garden', [198, 228, 348, 488, 628]),
  },
];

export const FEATURED_HOTELS = HOTEL_BRANDS.filter((h) => h.featured);
export const MORE_HOTELS = HOTEL_BRANDS.filter((h) => !h.featured);

export function findHotel(id: string): HotelBrand | undefined {
  return HOTEL_BRANDS.find((h) => h.id === id);
}

export function findRoomType(hotelId: string, roomTypeId: string): HotelRoomType | undefined {
  return findHotel(hotelId)?.roomTypes.find((room) => room.id === roomTypeId);
}
