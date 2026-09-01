export interface TicketAirport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface HotRoute {
  id: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  priceHint: number;
  tag?: string;
}

export interface FlightOption {
  id: string;
  flightNo: string;
  airline: string;
  airlineCode: string;
  fromCode: string;
  toCode: string;
  /** HH:mm local */
  departTime: string;
  arriveTime: string;
  duration: string;
  /** 参考经济舱起价（CNY），来自公开时刻/OTA 区间，实际以客服确认为准 */
  priceEconomy: number;
  priceBusiness: number;
  aircraft?: string;
  /** daily | 一周几天描述 */
  frequency: string;
  /** 直飞 / 经停 / 中转 */
  stopType: 'nonstop' | 'connect';
  note?: string;
}

/** 博胶国际机场 BOR — 金三角默认锚点 */
export const DEFAULT_AIRPORT: TicketAirport = {
  code: 'BOR',
  name: '博胶国际机场',
  city: '博胶',
  country: '老挝',
};

export const AIRPORTS: TicketAirport[] = [
  DEFAULT_AIRPORT,
  { code: 'VTE', name: '万象瓦岱国际机场', city: '万象', country: '老挝' },
  { code: 'LPQ', name: '琅勃拉邦国际机场', city: '琅勃拉邦', country: '老挝' },
  { code: 'KMG', name: '昆明长水国际机场', city: '昆明', country: '中国' },
  { code: 'CAN', name: '广州白云国际机场', city: '广州', country: '中国' },
  { code: 'TFU', name: '成都天府国际机场', city: '成都', country: '中国' },
  { code: 'PVG', name: '上海浦东国际机场', city: '上海', country: '中国' },
];

/** 博胶仅直达/可达：万象、琅勃拉邦（琅勃拉邦多为经万象中转） */
export const BOR_DESTINATION_CODES = ['VTE', 'LPQ'] as const;

/** 万象回国常用直飞城市 */
export const VTE_CHINA_CODES = ['KMG', 'CAN', 'TFU', 'PVG'] as const;

export function airportByCode(code: string): TicketAirport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

/** 根据出发地限制可选到达机场 */
export function destinationsFor(fromCode: string): TicketAirport[] {
  if (fromCode === 'BOR') {
    return AIRPORTS.filter((a) => (BOR_DESTINATION_CODES as readonly string[]).includes(a.code));
  }
  if (fromCode === 'LPQ') {
    return AIRPORTS.filter((a) => a.code === 'BOR' || a.code === 'VTE');
  }
  if (fromCode === 'VTE') {
    return AIRPORTS.filter(
      (a) =>
        a.code === 'BOR' ||
        a.code === 'LPQ' ||
        (VTE_CHINA_CODES as readonly string[]).includes(a.code),
    );
  }
  // 中国出发：回万象再衔接博胶
  if ((VTE_CHINA_CODES as readonly string[]).includes(fromCode)) {
    return AIRPORTS.filter((a) => a.code === 'VTE' || a.code === 'BOR');
  }
  return AIRPORTS.filter((a) => a.code !== fromCode);
}

export const HOT_ROUTES: HotRoute[] = [
  {
    id: 'bor-vte',
    fromCode: 'BOR',
    fromName: '博胶',
    toCode: 'VTE',
    toName: '万象',
    priceHint: 720,
    tag: '直飞',
  },
  {
    id: 'bor-lpq',
    fromCode: 'BOR',
    fromName: '博胶',
    toCode: 'LPQ',
    toName: '琅勃拉邦',
    priceHint: 1180,
    tag: '经万象',
  },
  {
    id: 'vte-kmg',
    fromCode: 'VTE',
    fromName: '万象',
    toCode: 'KMG',
    toName: '昆明',
    priceHint: 780,
    tag: '回国热门',
  },
  {
    id: 'vte-can',
    fromCode: 'VTE',
    fromName: '万象',
    toCode: 'CAN',
    toName: '广州',
    priceHint: 920,
    tag: '回国',
  },
  {
    id: 'vte-tfu',
    fromCode: 'VTE',
    fromName: '万象',
    toCode: 'TFU',
    toName: '成都',
    priceHint: 1080,
  },
  {
    id: 'vte-pvg',
    fromCode: 'VTE',
    fromName: '万象',
    toCode: 'PVG',
    toName: '上海',
    priceHint: 1280,
  },
];

/**
 * 参考时刻与价位（公开航线资料 / OTA 区间，2026）：
 * - BOR–VTE：老挝航空 QV902、澜沧航空 5A287/289、Lao Skyway LK249，约 1h，经济舱约 ¥690–850
 * - VTE–LPQ：老挝国内短途，约 ¥220–450
 * - VTE–KMG：东航 / 老航 / 川航直飞约 1h40–1h50，约 ¥780–950
 * - VTE–CAN：南航 / 老航 / 九元，约 ¥900–1100
 * - VTE–TFU：川航等，约 ¥1000–1200
 * - VTE–PVG：东航 MU284，约 ¥1200–1500
 */
export const FLIGHTS: FlightOption[] = [
  // ——— 博胶 ⇄ 万象 ———
  {
    id: 'qv902',
    flightNo: 'QV902',
    airline: '老挝航空',
    airlineCode: 'QV',
    fromCode: 'BOR',
    toCode: 'VTE',
    departTime: '09:00',
    arriveTime: '10:00',
    duration: '1h',
    priceEconomy: 780,
    priceBusiness: 1280,
    aircraft: 'ATR / A320',
    frequency: '每日',
    stopType: 'nonstop',
  },
  {
    id: '5a287',
    flightNo: '5A287',
    airline: '澜沧航空',
    airlineCode: '5A',
    fromCode: 'BOR',
    toCode: 'VTE',
    departTime: '11:20',
    arriveTime: '12:20',
    duration: '1h',
    priceEconomy: 720,
    priceBusiness: 1180,
    frequency: '每日',
    stopType: 'nonstop',
  },
  {
    id: '5a289',
    flightNo: '5A289',
    airline: '澜沧航空',
    airlineCode: '5A',
    fromCode: 'BOR',
    toCode: 'VTE',
    departTime: '16:40',
    arriveTime: '17:40',
    duration: '1h',
    priceEconomy: 740,
    priceBusiness: 1200,
    frequency: '每日',
    stopType: 'nonstop',
  },
  {
    id: 'lk249',
    flightNo: 'LK249',
    airline: 'Lao Skyway',
    airlineCode: 'LK',
    fromCode: 'BOR',
    toCode: 'VTE',
    departTime: '14:10',
    arriveTime: '15:15',
    duration: '1h05',
    priceEconomy: 690,
    priceBusiness: 1150,
    frequency: '每周四班',
    stopType: 'nonstop',
  },
  {
    id: 'qv901',
    flightNo: 'QV901',
    airline: '老挝航空',
    airlineCode: 'QV',
    fromCode: 'VTE',
    toCode: 'BOR',
    departTime: '07:30',
    arriveTime: '08:30',
    duration: '1h',
    priceEconomy: 780,
    priceBusiness: 1280,
    frequency: '每日',
    stopType: 'nonstop',
  },
  {
    id: '5a288',
    flightNo: '5A288',
    airline: '澜沧航空',
    airlineCode: '5A',
    fromCode: 'VTE',
    toCode: 'BOR',
    departTime: '13:00',
    arriveTime: '14:00',
    duration: '1h',
    priceEconomy: 720,
    priceBusiness: 1180,
    frequency: '每日',
    stopType: 'nonstop',
  },

  // ——— 博胶 → 琅勃拉邦（经万象） ———
  {
    id: 'bor-lpq-am',
    flightNo: 'QV902+QV111',
    airline: '老挝航空联程',
    airlineCode: 'QV',
    fromCode: 'BOR',
    toCode: 'LPQ',
    departTime: '09:00',
    arriveTime: '14:20',
    duration: '约5h20（含中转）',
    priceEconomy: 1180,
    priceBusiness: 1980,
    frequency: '每日',
    stopType: 'connect',
    note: '经万象瓦岱中转，无博胶直飞琅勃拉邦',
  },
  {
    id: 'bor-lpq-pm',
    flightNo: '5A287+QV115',
    airline: '澜沧+老航联程',
    airlineCode: '5A',
    fromCode: 'BOR',
    toCode: 'LPQ',
    departTime: '11:20',
    arriveTime: '17:05',
    duration: '约5h45（含中转）',
    priceEconomy: 1250,
    priceBusiness: 2050,
    frequency: '每日',
    stopType: 'connect',
    note: '经万象中转',
  },
  {
    id: 'lpq-bor-am',
    flightNo: 'QV112+QV901',
    airline: '老挝航空联程',
    airlineCode: 'QV',
    fromCode: 'LPQ',
    toCode: 'BOR',
    departTime: '08:00',
    arriveTime: '13:40',
    duration: '约5h40（含中转）',
    priceEconomy: 1180,
    priceBusiness: 1980,
    frequency: '每日',
    stopType: 'connect',
    note: '经万象中转回博胶',
  },

  // ——— 万象 ⇄ 琅勃拉邦 ———
  {
    id: 'qv111',
    flightNo: 'QV111',
    airline: '老挝航空',
    airlineCode: 'QV',
    fromCode: 'VTE',
    toCode: 'LPQ',
    departTime: '12:40',
    arriveTime: '13:40',
    duration: '1h',
    priceEconomy: 320,
    priceBusiness: 680,
    frequency: '每日',
    stopType: 'nonstop',
  },
  {
    id: 'qv115',
    flightNo: 'QV115',
    airline: '老挝航空',
    airlineCode: 'QV',
    fromCode: 'VTE',
    toCode: 'LPQ',
    departTime: '16:00',
    arriveTime: '17:00',
    duration: '1h',
    priceEconomy: 350,
    priceBusiness: 720,
    frequency: '每日',
    stopType: 'nonstop',
  },
  {
    id: 'qv112',
    flightNo: 'QV112',
    airline: '老挝航空',
    airlineCode: 'QV',
    fromCode: 'LPQ',
    toCode: 'VTE',
    departTime: '08:00',
    arriveTime: '09:00',
    duration: '1h',
    priceEconomy: 320,
    priceBusiness: 680,
    frequency: '每日',
    stopType: 'nonstop',
  },

  // ——— 万象回国 ———
  {
    id: 'mu-vte-kmg-m',
    flightNo: 'MU9624',
    airline: '中国东方航空',
    airlineCode: 'MU',
    fromCode: 'VTE',
    toCode: 'KMG',
    departTime: '07:25',
    arriveTime: '09:10',
    duration: '1h45',
    priceEconomy: 780,
    priceBusiness: 1680,
    aircraft: 'A320',
    frequency: '每日多班',
    stopType: 'nonstop',
  },
  {
    id: 'qv-vte-kmg',
    flightNo: 'QV615',
    airline: '老挝航空',
    airlineCode: 'QV',
    fromCode: 'VTE',
    toCode: 'KMG',
    departTime: '11:05',
    arriveTime: '12:50',
    duration: '1h45',
    priceEconomy: 850,
    priceBusiness: 1750,
    frequency: '每日',
    stopType: 'nonstop',
  },
  {
    id: '3u-vte-kmg',
    flightNo: '3U8092',
    airline: '四川航空',
    airlineCode: '3U',
    fromCode: 'VTE',
    toCode: 'KMG',
    departTime: '16:20',
    arriveTime: '18:05',
    duration: '1h45',
    priceEconomy: 820,
    priceBusiness: 1700,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
  {
    id: 'cz-vte-can',
    flightNo: 'CZ3072',
    airline: '中国南方航空',
    airlineCode: 'CZ',
    fromCode: 'VTE',
    toCode: 'CAN',
    departTime: '13:10',
    arriveTime: '15:40',
    duration: '2h30',
    priceEconomy: 980,
    priceBusiness: 2180,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
  {
    id: 'qv-vte-can',
    flightNo: 'QV881',
    airline: '老挝航空',
    airlineCode: 'QV',
    fromCode: 'VTE',
    toCode: 'CAN',
    departTime: '09:00',
    arriveTime: '11:30',
    duration: '2h30',
    priceEconomy: 1050,
    priceBusiness: 2280,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
  {
    id: 'aq-vte-can',
    flightNo: 'AQ1258',
    airline: '九元航空',
    airlineCode: 'AQ',
    fromCode: 'VTE',
    toCode: 'CAN',
    departTime: '18:50',
    arriveTime: '21:20',
    duration: '2h30',
    priceEconomy: 920,
    priceBusiness: 1980,
    frequency: '每周多班',
    stopType: 'nonstop',
    note: '廉航参考价，行李额请留意',
  },
  {
    id: '3u-vte-tfu',
    flightNo: '3U3928',
    airline: '四川航空',
    airlineCode: '3U',
    fromCode: 'VTE',
    toCode: 'TFU',
    departTime: '15:20',
    arriveTime: '17:50',
    duration: '2h30',
    priceEconomy: 1080,
    priceBusiness: 2380,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
  {
    id: 'mu-vte-tfu',
    flightNo: 'MU2662',
    airline: '中国东方航空',
    airlineCode: 'MU',
    fromCode: 'VTE',
    toCode: 'TFU',
    departTime: '10:30',
    arriveTime: '13:00',
    duration: '2h30',
    priceEconomy: 1120,
    priceBusiness: 2450,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
  {
    id: 'mu284',
    flightNo: 'MU284',
    airline: '中国东方航空',
    airlineCode: 'MU',
    fromCode: 'VTE',
    toCode: 'PVG',
    departTime: '01:00',
    arriveTime: '06:10',
    duration: '4h10',
    priceEconomy: 1280,
    priceBusiness: 2880,
    aircraft: 'A320',
    frequency: '每周多班',
    stopType: 'nonstop',
    note: '红眼航班，次日清晨抵达浦东',
  },

  // ——— 中国 → 万象（回国返程对飞，便于往返查询） ———
  {
    id: 'mu-kmg-vte',
    flightNo: 'MU9623',
    airline: '中国东方航空',
    airlineCode: 'MU',
    fromCode: 'KMG',
    toCode: 'VTE',
    departTime: '15:40',
    arriveTime: '16:25',
    duration: '1h45',
    priceEconomy: 780,
    priceBusiness: 1680,
    frequency: '每日多班',
    stopType: 'nonstop',
  },
  {
    id: 'cz-can-vte',
    flightNo: 'CZ3071',
    airline: '中国南方航空',
    airlineCode: 'CZ',
    fromCode: 'CAN',
    toCode: 'VTE',
    departTime: '09:00',
    arriveTime: '10:30',
    duration: '2h30',
    priceEconomy: 980,
    priceBusiness: 2180,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
  {
    id: '3u-tfu-vte',
    flightNo: '3U3927',
    airline: '四川航空',
    airlineCode: '3U',
    fromCode: 'TFU',
    toCode: 'VTE',
    departTime: '11:10',
    arriveTime: '12:40',
    duration: '2h30',
    priceEconomy: 1080,
    priceBusiness: 2380,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
  {
    id: 'mu283',
    flightNo: 'MU283',
    airline: '中国东方航空',
    airlineCode: 'MU',
    fromCode: 'PVG',
    toCode: 'VTE',
    departTime: '21:30',
    arriveTime: '00:35+1',
    duration: '4h05',
    priceEconomy: 1280,
    priceBusiness: 2880,
    frequency: '每周多班',
    stopType: 'nonstop',
  },
];

export function searchFlights(fromCode: string, toCode: string): FlightOption[] {
  return FLIGHTS.filter((f) => f.fromCode === fromCode && f.toCode === toCode).sort(
    (a, b) => a.priceEconomy - b.priceEconomy,
  );
}

export function flightPrice(flight: FlightOption, cabin: 'economy' | 'business'): number {
  return cabin === 'business' ? flight.priceBusiness : flight.priceEconomy;
}
