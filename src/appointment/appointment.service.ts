import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from '../auth/dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../auth/dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  // Crear cita
  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = new this.appointmentModel(dto);
    return appointment.save();
  }

  // Listar citas con filtros
  async findAll(query?: {
    doctorId?: string;
    patientId?: string;
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const page  = query?.page  ?? 1;
    const limit = query?.limit ?? 10;
    const skip  = (page - 1) * limit;

    const filter: any = {};

    if (query?.doctorId)  filter.doctorId  = query.doctorId;
    if (query?.patientId) filter.patientId = query.patientId;
    if (query?.status)    filter.status    = query.status;
    if (query?.date) {
      const start = new Date(query.date);
      const end   = new Date(query.date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const [data, total] = await Promise.all([
      this.appointmentModel
        .find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId',  'fullname email specialty')
        .skip(skip)
        .limit(limit)
        .sort({ date: 1, startTime: 1 }),
      this.appointmentModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  // Obtener cita por ID
  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patientId', 'firstName lastName email phone dateOfBirth gender')
      .populate('doctorId',  'fullname email specialty');

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    return appointment;
  }

  // Actualizar cita (estado, notas, etc.)
  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    )
      .populate('patientId', 'firstName lastName')
      .populate('doctorId',  'fullname specialty');

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    return appointment;
  }

  // Eliminar cita
  async remove(id: string): Promise<{ message: string }> {
    const appointment = await this.appointmentModel.findByIdAndDelete(id);
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    return { message: 'Cita eliminada exitosamente' };
  }

  // Citas de hoy para el doctor (para el Dashboard)
  async findTodayByDoctor(doctorId: string): Promise<Appointment[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.appointmentModel
      .find({ doctorId, date: { $gte: start, $lte: end } })
      .populate('patientId', 'firstName lastName')
      .sort({ startTime: 1 });
  }
}