import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './patient.schema';
import { CreatePatientDto } from '../auth/dto/create-patient.dto';
import { UpdatePatientDto } from '../auth/dto/update-patiend.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
  ) {}

  // Crear paciente
  async create(dto: CreatePatientDto): Promise<Patient> {
    const existing = await this.patientModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Ya existe un paciente con este correo');
    }
    const patient = new this.patientModel(dto);
    return patient.save();
  }

  // Listar todos los pacientes (con búsqueda y filtros opcionales)
  async findAll(query?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    const page  = query?.page  ?? 1;
    const limit = query?.limit ?? 10;
    const skip  = (page - 1) * limit;

    const filter: any = {};

    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { firstName: regex },
        { lastName:  regex },
        { email:     regex },
        { phone:     regex },
      ];
    }

    const [data, total] = await Promise.all([
      this.patientModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.patientModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  // Obtener un paciente por ID
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id);
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }
    return patient;
  }

  // Actualizar paciente (PATCH — solo campos enviados)
  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.patientModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }
    return patient;
  }

  // Eliminar paciente
  async remove(id: string): Promise<{ message: string }> {
    const patient = await this.patientModel.findByIdAndDelete(id);
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }
    return { message: 'Paciente eliminado exitosamente' };
  }
}