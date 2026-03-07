import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Leer los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),  // método específico
      context.getClass(),    // clase completa
    ]);

    // 2. Si no hay @Roles() definido, el endpoint es público (solo requiere JWT)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Obtener el usuario desde el request (ya fue validado por AuthGuard('jwt'))
    const { user } = context.switchToHttp().getRequest();

    // 4. Verificar que el rol del usuario esté en los roles permitidos
    const hasRole = requiredRoles.some((role) => user?.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}