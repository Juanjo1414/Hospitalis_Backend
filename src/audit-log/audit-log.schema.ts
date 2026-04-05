import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS = 'access',
}

@Schema({ timestamps: true })
export class AuditLog {
  /** Usuario que realizó la acción (null si es anónimo) */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId!: Types.ObjectId | null;

  /** Nombre completo para referencia rápida sin populate */
  @Prop({ default: '' })
  userFullName!: string;

  /** Tipo de acción */
  @Prop({ type: String, enum: Object.values(AuditAction), required: true })
  action!: AuditAction;

  /** Recurso afectado, ej: "patients", "appointments" */
  @Prop({ required: true })
  resource!: string;

  /** ID del documento afectado */
  @Prop({ type: Types.ObjectId, ref: 'Patient', default: null })
  resourceId!: Types.ObjectId | null;

  /** Descripción legible de la operación */
  @Prop({ default: '' })
  description!: string;

  /** IP del cliente (opcional) */
  @Prop({ default: '' })
  ipAddress!: string;

  /** Código HTTP resultante (opcional) */
  @Prop({ type: Number, default: null })
  statusCode!: number | null;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ resource: 1 });
AuditLogSchema.index({ createdAt: -1 });
