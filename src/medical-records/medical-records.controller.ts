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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from '../auth/dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../auth/dto/update-medical-record.dto';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

// ─── Ambos guards se aplican a TODOS los endpoints del controller ───────────
// AuthGuard('jwt') verifica que el token JWT sea válido
// RolesGuard verifica que el rol del usuario sea el permitido
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  // ── POST /medical-records ──────────────────────────────────────────────────
  // Solo médicos pueden crear registros clínicos
  @Post()
  @Roles(Role.MEDICO, Role.ADMIN)
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  // ── GET /medical-records/patient/:id ──────────────────────────────────────
  // Historial médico del paciente con filtros opcionales (tipo, estado, rango de fechas)
  @Get('patient/:id')
  @Roles(Role.MEDICO, Role.ADMIN)
  findByPatient(
    @Param('id') patientId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.medicalRecordsService.findByPatient(patientId, {
      type: type as any,
      status,
      from,
      to,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  // ── GET /medical-records/patient/:id/summary ───────────────────────────────
  @Get('patient/:id/summary')
  @Roles(Role.MEDICO, Role.ADMIN)
  getSummary(@Param('id') patientId: string) {
    return this.medicalRecordsService.getSummary(patientId);
  }

  // ── GET /medical-records/:id ───────────────────────────────────────────────
  @Get(':id')
  @Roles(Role.MEDICO, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  // ── PATCH /medical-records/:id ─────────────────────────────────────────────
  @Patch(':id')
  @Roles(Role.MEDICO, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  // ── DELETE /medical-records/:id ────────────────────────────────────────────
  // Solo admin puede eliminar registros clínicos
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(id);
  }
}