import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';

export const ROLES_KEY = 'roles';

// Uso: @Roles(Role.MEDICO) o @Roles(Role.ADMIN, Role.MEDICO)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);