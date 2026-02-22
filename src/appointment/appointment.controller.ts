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
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointment.service';
import { CreateAppointmentDto } from '../auth/dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../auth/dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // POST /appointments
  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  // GET /appointments?doctorId=&patientId=&status=&date=&page=&limit=
  @Get()
  findAll(
    @Query('doctorId')  doctorId?:  string,
    @Query('patientId') patientId?: string,
    @Query('status')    status?:    string,
    @Query('date')      date?:      string,
    @Query('page')      page?:      string,
    @Query('limit')     limit?:     string,
  ) {
    return this.appointmentsService.findAll({
      doctorId,
      patientId,
      status,
      date,
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  // GET /appointments/today — citas de hoy del doctor autenticado
  @Get('today')
  findToday(@Req() req: any) {
    return this.appointmentsService.findTodayByDoctor(req.user.userId);
  }

  // GET /appointments/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // PATCH /appointments/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  // DELETE /appointments/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}