import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

export enum PrescriptionStatus {
  ACTIVE    = 'active',
  EXPIRED   = 'expired',
  CANCELLED = 'cancelled',
}

export enum RouteOfAdmin {
  ORAL        = 'oral',
  INTRAVENOUS = 'intravenous',
  INTRAMUSCULAR = 'intramuscular',
  SUBCUTANEOUS  = 'subcutaneous',
  TOPICAL     = 'topical',
  INHALED     = 'inhaled',
  OTHER       = 'other',
}

@Schema({ timestamps: true })
export class Prescription {
  // ── Relaciones ──────────────────────────────────────────────────────────────
  /** Paciente al que se le prescribe */
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId!: Types.ObjectId;

  /** Cita durante la cual se generó la receta (opcional) */
  @Prop({ type: Types.ObjectId, ref: 'Appointment', default: null })
  appointmentId!: Types.ObjectId | null;

  /** Médico que emite la receta (del JWT) */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId!: Types.ObjectId;

  // ── Medicamento ─────────────────────────────────────────────────────────────
  @Prop({ required: true, trim: true })
  medication!: string;

  @Prop({ required: true })
  dosage!: number;

  @Prop({ required: true, trim: true, default: 'mg' })
  unit!: string;          // mg, ml, g, mcg, UI, etc.

  @Prop({ required: true, trim: true })
  frequency!: string;     // '1x al día', '2x al día', 'cada 8 horas', etc.

  @Prop({ required: true, trim: true })
  duration!: string;      // '7 días', '1 mes', 'indefinido', etc.

  @Prop({
    type: String,
    enum: Object.values(RouteOfAdmin),
    default: RouteOfAdmin.ORAL,
  })
  route!: RouteOfAdmin;

  @Prop({ trim: true, default: '' })
  instructions!: string;

  // ── Estado ──────────────────────────────────────────────────────────────────
  @Prop({
    type: String,
    enum: Object.values(PrescriptionStatus),
    default: PrescriptionStatus.ACTIVE,
  })
  status!: PrescriptionStatus;

  // ── Soft delete ─────────────────────────────────────────────────────────────
  @Prop({ default: false })
  isDeleted!: boolean;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);