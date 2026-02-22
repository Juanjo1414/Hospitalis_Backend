import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export enum AppointmentStatus {
  SCHEDULED  = 'scheduled',
  CONFIRMED  = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED  = 'completed',
  CANCELLED  = 'cancelled',
  NO_SHOW    = 'no_show',
}

export enum AppointmentType {
  CHECKUP      = 'checkup',
  FOLLOW_UP    = 'follow_up',
  CONSULTATION = 'consultation',
  EMERGENCY    = 'emergency',
  PROCEDURE    = 'procedure',
  LAB          = 'lab',
}

@Schema({ timestamps: true })
export class Appointment {
  // Relación con el paciente
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  // Relación con el doctor (User)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  // Fecha y hora
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string;   // "09:00"

  @Prop({ required: true })
  endTime: string;     // "09:30"

  // Tipo y estado
  @Prop({
    type: String,
    enum: AppointmentType,
    default: AppointmentType.CHECKUP,
  })
  type: AppointmentType;

  @Prop({
    type: String,
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  // Motivo de consulta
  @Prop({ required: true })
  reason: string;

  // Notas del doctor (se llenan en la consulta)
  @Prop({ default: '' })
  notes: string;

  // Sala / consultorio
  @Prop({ default: '' })
  room: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);