import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

export enum PatientStatus {
  ACTIVE     = 'active',
  INACTIVE   = 'inactive',
  INPATIENT  = 'inpatient',
  DISCHARGED = 'discharged',
}

export enum BloodType {
  A_POS  = 'A+',  A_NEG  = 'A-',
  B_POS  = 'B+',  B_NEG  = 'B-',
  AB_POS = 'AB+', AB_NEG = 'AB-',
  O_POS  = 'O+',  O_NEG  = 'O-',
}

@Schema({ timestamps: true })
export class Patient {
  // ── Identidad ──────────────────────────────────────────
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: ['male', 'female', 'other'] })
  gender: string;

  // ── Contacto ───────────────────────────────────────────
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  address: string;

  // ── Contacto de emergencia ─────────────────────────────
  @Prop({ default: '' })
  emergencyContactName: string;

  @Prop({ default: '' })
  emergencyContactPhone: string;

  // ── Perfil clínico ─────────────────────────────────────
  @Prop({ type: String, enum: BloodType, default: null })
  bloodType: string;

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  chronicConditions: string[];

  @Prop({ default: '' })
  notes: string;

  // ── Estado ─────────────────────────────────────────────
  @Prop({
    type: String,
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
  })
  status: PatientStatus;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);