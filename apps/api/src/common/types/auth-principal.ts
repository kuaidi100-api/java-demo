import { PrincipalType } from '@prisma/client';

export interface AuthPrincipal {
  id: string;
  type: PrincipalType;
  tokenVersion: number;
  roles: string[];
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  type: PrincipalType;
  version: number;
  roles: string[];
  permissions: string[];
}
