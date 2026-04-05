import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles/roles.decorator";
import { RolesGuard } from "../auth/roles/roles.guard";
import { Role } from "../auth/roles/roles.enum";
import { SystemConfigService } from "./system-config.service";

@UseGuards(AuthGuard("jwt"))
@Controller("settings")
export class SystemConfigController {
  constructor(private readonly service: SystemConfigService) {}

  /** GET /settings  — cualquier usuario autenticado puede leer la config */
  @Get()
  get() {
    return this.service.get();
  }

  /** PUT /settings  — solo admin puede modificar */
  @Put()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Body() dto: any) {
    // Eliminar campos protegidos antes de actualizar
    const { _id, key, __v, createdAt, updatedAt, ...safe } = dto;
    return this.service.update(safe);
  }
}