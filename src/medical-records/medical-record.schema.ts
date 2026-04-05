import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & Document;

export enum RecordType {
  DIAGNOSIS    = 'diagnosis',
  CLINICAL_NOTE = 'clinical_note',
  LAB_RESULT   = 'lab_result',
  PRESCRIPTION = 'prescription',
  PROCEDURE    = 'procedure',
  VITAL_SIGNS  = 'vital_signs',
}

export enum RecordStatus {
  ACTIVE   = 'active',
  RESOLVED = 'resolved',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class MedicalRecord {
  // ── Relaciones ──────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment', default: null })
  appointmentId!: Types.ObjectId | null;

  // ── Clasificación ────────────────────────────────────────
  @Prop({
    type: String,
    enum: RecordType,
    required: true,
  })
  type!: RecordType;

  @Prop({
    type: String,
    enum: RecordStatus,
    default: RecordStatus.ACTIVE,
  })
  status!: RecordStatus;

  // ── Contenido principal ──────────────────────────────────
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ trim: true })
  icdCode!: string; // Código ICD-10 para diagnósticos

  // ── Signos vitales (solo cuando type = vital_signs) ──────
  @Prop({ type: Object, default: null })
  vitals!: {
    heartRate?: number;       // bpm
    bloodPressure?: string;   // "120/80"
    temperature?: number;     // °C
    weight?: number;          // kg
    height?: number;          // cm
    oxygenSaturation?: number; // %
    respiratoryRate?: number;  // rpm
  } | null;

  // ── Resultado de laboratorio ─────────────────────────────
  @Prop({ type: Object, default: null })
  labResult!: {
    testName?: string;
    result?: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
  } | null;

  // ── Archivos adjuntos ────────────────────────────────────
  @Prop({ type: [String], default: [] })
  attachments!: string[]; // URLs de archivos/imágenes

  // ── Metadatos ────────────────────────────────────────────
  @Prop({ default: Date.now })
  recordDate!: Date;

  @Prop({ trim: true })
  notes!: string; // Notas adicionales del médico

  @Prop({ type: [String], default: [] })
  tags!: string[]; // Etiquetas para búsqueda
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

// Índices para búsquedas eficientes
MedicalRecordSchema.index({ patientId: 1, recordDate: -1 });
MedicalRecordSchema.index({ patientId: 1, type: 1 });
MedicalRecordSchema.index({ doctorId: 1 });