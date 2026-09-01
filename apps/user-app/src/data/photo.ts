export type PhotoCategory = 'family' | 'portrait' | 'travel';

export interface PhotoSample {
  id: string;
  category: PhotoCategory;
  title: string;
  tone: string;
}

export interface PhotoPackage {
  id: string;
  name: string;
  outfits: number;
  retouched: number;
  hours: number;
  priceHint: string;
  summary: string;
}

export const PHOTO_CATEGORIES: { id: PhotoCategory; label: string }[] = [
  { id: 'family', label: '亲子' },
  { id: 'portrait', label: '特写' },
  { id: 'travel', label: '旅拍' },
];

export const PHOTO_SAMPLES: PhotoSample[] = [
  { id: 's1', category: 'travel', title: '特区河畔光影', tone: 'linear-gradient(160deg,#2a3f55,#8eb6d4)' },
  { id: 's2', category: 'family', title: '亲子庭院午后', tone: 'linear-gradient(160deg,#5a4638,#d4b896)' },
  { id: 's3', category: 'portrait', title: '侧脸金色时刻', tone: 'linear-gradient(160deg,#3d2c4a,#c9a0dc)' },
  { id: 's4', category: 'travel', title: '木棉大道漫步', tone: 'linear-gradient(160deg,#1f4d3a,#7dba98)' },
  { id: 's5', category: 'family', title: '码头风与笑', tone: 'linear-gradient(160deg,#4a3a28,#e0c3a0)' },
  { id: 's6', category: 'portrait', title: '夜景霓虹特写', tone: 'linear-gradient(160deg,#1a1f3a,#6a7fd4)' },
];

export const PHOTO_PACKAGES: PhotoPackage[] = [
  {
    id: 'basic',
    name: '基础旅拍',
    outfits: 2,
    retouched: 15,
    hours: 2,
    priceHint: '起',
    summary: '适合短途打卡，含 2 套服装与 15 张精修。',
  },
  {
    id: 'premium',
    name: '尊享旅拍',
    outfits: 4,
    retouched: 40,
    hours: 4,
    priceHint: '起',
    summary: '全天跟拍升级，含 4 套服装与 40 张精修，附短视频花絮。',
  },
];

export const PHOTO_REELS = [
  { id: 'r1', title: '河畔运镜花絮', tone: 'linear-gradient(120deg,#0f2027,#2c5364)' },
  { id: 'r2', title: '卡点混剪预告', tone: 'linear-gradient(120deg,#232526,#414345)' },
];

export function findPhotoPackage(id: string): PhotoPackage | undefined {
  return PHOTO_PACKAGES.find((p) => p.id === id);
}
