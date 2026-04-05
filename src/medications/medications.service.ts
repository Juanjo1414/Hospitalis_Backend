import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medication, MedicationDocument } from './medication.schema';
import { CreateMedicationDto, UpdateMedicationDto } from '../auth/dto/medication.dto';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectModel(Medication.name)
    private readonly model: Model<MedicationDocument>,
  ) {}

  async create(dto: CreateMedicationDto) {
    const exists = await this.model.findOne({ name: dto.name, isDeleted: false });
    if (exists) throw new ConflictException(`El medicamento "${dto.name}" ya existe.`);
    return this.model.create(dto);
  }

  async findAll(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const filter: Record<string, any> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.search) filter.name = { $regex: query.search, $options: "i" };

    const page  = Math.max(1, query.page  ?? 1);
    const limit = Math.min(100, query.limit ?? 50);
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const doc = await this.model.findOne({ _id: id, isDeleted: false });
    if (!doc) throw new NotFoundException("Medicamento no encontrado");
    return doc;
  }

  async update(id: string, dto: UpdateMedicationDto) {
    const doc = await this.findOne(id);
    Object.assign(doc, dto);
    return doc.save();
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    doc.isDeleted = true;
    return doc.save();
  }
}