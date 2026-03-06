import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from '../auth/dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../auth/dto/update-medical-record.dto';
import { RecordType } from './medical-record.schema';

@UseGuards(AuthGuard('jwt'))
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly service: MedicalRecordsService) {}

  // ── POST /medical-records ─────────────────────────────────
  // Crear un nuevo registro clínico
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.service.create(dto);
  }

  // ── GET /medical-records/patient/:patientId ───────────────
  // Historial clínico completo de un paciente (con filtros y paginación)
  @Get('patient/:patientId')
  findByPatient(
    @Param('patientId') patientId: string,
    @Query('type')   type?: RecordType,
    @Query('status') status?: string,
    @Query('from')   from?: string,
    @Query('to')     to?: string,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
  ) {
    return this.service.findByPatient(patientId, {
      type,
      status,
      from,
      to,
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  // ── GET /medical-records/patient/:patientId/summary ───────
  // Resumen clínico del paciente (totales, condiciones activas, último registro)
  @Get('patient/:patientId/summary')
  getSummary(@Param('patientId') patientId: string) {
    return this.service.getSummary(patientId);
  }

  // ── GET /medical-records/:id ──────────────────────────────
  // Un registro específico con todos sus datos populados
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ── PATCH /medical-records/:id ────────────────────────────
  // Actualización parcial de un registro
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.service.update(id, dto);
  }

  // ── DELETE /medical-records/:id ───────────────────────────
  // Eliminar un registro clínico
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}