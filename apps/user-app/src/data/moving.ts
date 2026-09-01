import { SEZ_LANDMARKS_IN_ZONE, type SezPoint } from './geo-sez';

export interface MovingVehicle {
  id: 'small' | 'large';
  name: string;
  capacity: string;
  hint: string;
  tone: string;
}

export type ZonePoint = SezPoint;

export const MOVING_VEHICLES: MovingVehicle[] = [
  {
    id: 'small',
    name: '小车',
    capacity: '约 8–12 件登机箱',
    hint: '行李 / 少量家具',
    tone: 'linear-gradient(145deg,#1e3a5f,#3d7ea6)',
  },
  {
    id: 'large',
    name: '大车',
    capacity: '约 1 室家具 + 纸箱',
    hint: '短途整屋搬家',
    tone: 'linear-gradient(145deg,#1f3d2e,#4a8f6a)',
  },
];

export const ZONE_POINTS: ZonePoint[] = SEZ_LANDMARKS_IN_ZONE;

export const APPOINT_SLOTS = [
  { id: 'morning', label: '上午' },
  { id: 'afternoon', label: '下午' },
  { id: 'evening', label: '傍晚' },
] as const;
