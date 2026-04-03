import { RoleGuard } from '@guards/role/role.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Role } from '@prisma/client';
import { AuthGuard } from '../guards/auth.guard';
export const ROLE_KEY = 'roles';
export function AuthProtection(...roles: Role[]) {
  return applyDecorators(
    SetMetadata(ROLE_KEY, roles),
    UseGuards(AuthGuard, RoleGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
