import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Prescription,
  PrescriptionDocument,
  PrescriptionStatus,
} from './prescription.schema';
import { CreatePrescriptionDto } from '../auth/dto/prescription.dto';
import { UpdatePrescriptionDto } from '../auth/dto/prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel(Prescription.name)
    private readonly model: Model<PrescriptionDocument>,
  ) {}

  // ── Crear ──────────────────────────────────────────────────────────────────
  async create(dto: CreatePrescriptionDto, doctorId: string) {
    const doc = await this.model.create({
      ...dto,
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(dto.patientId),
      appointmentId: dto.appointmentId
        ? new Types.ObjectId(dto.appointmentId)
        : null,
    });
    return doc.populate([
      { path: 'patientId', select: 'firstName lastName' },
      { path: 'doctorId', select: 'fullname email' },
    ]);
  }

  // ── Listar (con filtros opcionales) ────────────────────────────────────────
  async findAll(query: {
    patientId?: string;
    status?: string;
    doctorId?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: Record<string, any> = { isDeleted: false };

    if (query.patientId) filter.patientId = new Types.ObjectId(query.patientId);
    if (query.doctorId) filter.doctorId = new Types.ObjectId(query.doctorId);
    if (query.status) filter.status = query.status;

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'fullname email')
        .populate('appointmentId', 'date startTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  // ── Obtener una ────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const doc = await this.model
      .findOne({ _id: id, isDeleted: false })
      .populate('patientId', 'firstName lastName dateOfBirth')
      .populate('doctorId', 'fullname email specialty')
      .populate('appointmentId', 'date startTime type');
    if (!doc) throw new NotFoundException('Prescripción no encontrada');
    return doc;
  }

  // ── Actualizar ─────────────────────────────────────────────────────────────
  async update(
    id: string,
    dto: UpdatePrescriptionDto,
    _requesterId: string,
    _requesterRole: string,
  ) {
    const doc = await this.findOne(id);

    // Extraer campos de referencia para manejarlos por separado
    const { patientId, appointmentId: _a, doctorId: _d, ...safeDto } = dto as any;

    // Actualizar campos normales
    Object.assign(doc, safeDto);

    // Actualizar patientId si viene en el DTO, convirtiéndolo a ObjectId
    if (patientId) {
      doc.patientId = new Types.ObjectId(patientId);
    }

    return doc.save();
  }

  // ── Soft delete ────────────────────────────────────────────────────────────
  async remove(id: string, _requesterId: string, _requesterRole: string) {
    const doc = await this.findOne(id);

    // Cualquier usuario autenticado (médico o admin) puede eliminar
    doc.isDeleted = true;
    doc.status = PrescriptionStatus.CANCELLED;

    return doc.save();
  }

  // ── Prescripciones activas de un paciente (usado en MedicalRecords) ────────
  async findActiveByPatient(patientId: string) {
    return this.model
      .find({
        patientId: new Types.ObjectId(patientId),
        status: PrescriptionStatus.ACTIVE,
        isDeleted: false,
      })
      .populate('doctorId', 'fullname')
      .sort({ createdAt: -1 });
  }
}
