import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles/roles.decorator";
import { RolesGuard } from "../auth/roles/roles.guard";
import { Role } from "../auth/roles/roles.enum";
import { MedicationsService } from "./medications.service";
import { CreateMedicationDto, UpdateMedicationDto } from "../auth/dto/medication.dto";

@UseGuards(AuthGuard("jwt"))
@Controller("medications")
export class MedicationsController {
  constructor(private readonly service: MedicationsService) {}

  /** GET /medications  — cualquier usuario autenticado puede consultar el catálogo */
  @Get()
  findAll(@Query() q: any) {
    return this.service.findAll({
      status: q.status,
      search: q.search,
      page:   q.page  ? +q.page  : 1,
      limit:  q.limit ? +q.limit : 50,
    });
  }

  /** GET /medications/:id */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  /** POST /medications  — solo admin */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateMedicationDto) {
    return this.service.create(dto);
  }

  /** PATCH /medications/:id  — solo admin */
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateMedicationDto) {
    return this.service.update(id, dto);
  }

  /** DELETE /medications/:id  — solo admin (soft delete) */
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}