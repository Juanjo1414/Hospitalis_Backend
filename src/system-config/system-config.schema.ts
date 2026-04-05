import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SystemConfigDocument = SystemConfig & Document;

@Schema({ timestamps: true })
export class SystemConfig {
  /** Clave única que identifica este registro singleton */
  @Prop({ default: "global", unique: true })
  key!: string;

  @Prop({ default: "Hospitalis" })
  hospitalName!: string;

  @Prop({ default: "" })
  hospitalAddress!: string;

  @Prop({ default: "" })
  hospitalPhone!: string;

  @Prop({ default: "" })
  hospitalEmail!: string;

  @Prop({ default: "America/Bogota" })
  timezone!: string;

  @Prop({ default: "es-CO" })
  locale!: string;

  /** Duración por defecto de una cita en minutos */
  @Prop({ default: 30 })
  defaultAppointmentDuration!: number;

  /** Número máximo de citas por día por médico */
  @Prop({ default: 20 })
  maxAppointmentsPerDay!: number;

  /** Permite registro de nuevos usuarios */
  @Prop({ default: true })
  allowRegistration!: boolean;

  /** Modo mantenimiento */
  @Prop({ default: false })
  maintenanceMode!: boolean;
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);