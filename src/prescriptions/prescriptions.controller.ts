import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from '../auth/dto/prescription.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly service: PrescriptionsService) {}

  /**
   * POST /prescriptions
   * Cualquier médico autenticado puede crear una receta.
   */
  @Post()
  create(@Body() dto: CreatePrescriptionDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  /**
   * GET /prescriptions
   * Query params opcionales: patientId, status, doctorId, page, limit
   */
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll({
      patientId: query.patientId,
      status:    query.status,
      doctorId:  query.doctorId,
      page:      query.page  ? +query.page  : 1,
      limit:     query.limit ? +query.limit : 20,
    });
  }

  /**
   * GET /prescriptions/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * PATCH /prescriptions/:id
   * Solo el médico creador o un admin puede editar.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId, req.user.role);
  }

  /**
   * DELETE /prescriptions/:id  (soft delete — marca como cancelada)
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.user.userId, req.user.role);
  }
}