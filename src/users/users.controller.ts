import {
  Controller, Get, Patch, Delete, Body, Param,
  Query, UseGuards, Req, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';
import { UserRole } from './user.schema';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/profile — perfil del usuario autenticado (cualquier rol)
  @Get('profile')
  @Roles(Role.ADMIN, Role.MEDICO)
  async getProfile(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.findOne(userId);
  }

  // GET /users — listar todos los usuarios (Admin y Medico para buscar contactos)
  @Get()
  @Roles(Role.ADMIN, Role.MEDICO)
  findAll(
    @Query('role')     role?:     string,
    @Query('isActive') isActive?: string,
    @Query('page')     page?:     string,
    @Query('limit')    limit?:    string,
  ) {
    return this.usersService.findAll({
      role:     role || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page:     page  ? parseInt(page,  10) : 1,
      limit:    limit ? parseInt(limit, 10) : 10,
    });
  }

  // GET /users/:id — obtener usuario por ID (Admin o propio usuario)
  @Get(':id')
  @Roles(Role.ADMIN, Role.MEDICO)
  findOne(@Req() req: any, @Param('id') id: string) {
    const isAdmin = req.user.role === Role.ADMIN;
    // req.user.userId es inyectado por JwtStrategy
    const userId = req.user.userId;
    
    if (!isAdmin && userId !== id) {
      throw new ForbiddenException("No tienes permiso para ver este perfil");
    }
    return this.usersService.findOne(id);
  }

  // PATCH /users/:id — actualizar usuario (Admin o el propio usuario)
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MEDICO)
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: {
      fullname?: string;
      email?: string;
      specialty?: string;
      role?: UserRole;
      isActive?: boolean;
      currentPassword?: string;
      password?: string;
    },
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    
    const userId = req.user.userId;
    
    // 1. Un usuario no admin solo puede editarse a sí mismo
    if (!isAdmin && userId !== id) {
      throw new ForbiddenException("No tienes permiso para editar este perfil");
    }

    // 2. Un usuario no admin no puede cambiar su rol o estado activo
    if (!isAdmin) {
      delete dto.role;
      delete dto.isActive;
    }

    return this.usersService.update(id, dto);
  }

  // DELETE /users/:id — desactivar usuario (solo Admin)
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // DELETE /users/:id/hard — eliminar permanentemente (solo Admin)
  @Delete(':id/hard')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  hardDelete(@Param('id') id: string) {
    return this.usersService.hardDelete(id);
  }
}