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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from '../auth/dto/create-patient.dto';
import { UpdatePatientDto } from '../auth/dto/update-patiend.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)   // Todos los endpoints requieren JWT
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // POST /patients — Crear paciente
  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  // GET /patients?search=&status=&page=&limit=  — Listar con filtros
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
  ) {
    return this.patientsService.findAll({
      search,
      status,
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  // GET /patients/:id — Detalle de un paciente
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  // PATCH /patients/:id — Actualizar paciente
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  // DELETE /patients/:id — Eliminar paciente
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}