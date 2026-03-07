import {
  Controller, Get, Patch, Delete, Body, Param,
  Query, UseGuards, Req, HttpCode, HttpStatus,
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
  getProfile(@Req() req: any) {
    return req.user;
  }

  // GET /users — listar todos los usuarios (solo Admin)
  @Get()
  @Roles(Role.ADMIN)
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

  // GET /users/:id — obtener usuario por ID (solo Admin)
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PATCH /users/:id — actualizar usuario (solo Admin)
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: {
      fullname?: string;
      email?: string;
      role?: UserRole;
      isActive?: boolean;
      password?: string;
    },
  ) {
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