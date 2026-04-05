import {
  IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional,
  IsPositive, IsString, MinLength,
} from 'class-validator';
import { PrescriptionStatus, RouteOfAdmin } from '../../prescriptions/prescription.schema';

export class CreatePrescriptionDto {
  @IsMongoId()
  patientId!: string;

  @IsOptional()
  @IsMongoId()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  medication!: string;

  @IsNumber()
  @IsPositive()
  dosage!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @IsString()
  @IsNotEmpty()
  duration!: string;

  @IsOptional()
  @IsEnum(RouteOfAdmin)
  route?: RouteOfAdmin;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;
}

export class UpdatePrescriptionDto {
  // El frontend puede enviar patientId/appointmentId; se aceptan pero el service los descarta
  @IsOptional()
  @IsMongoId()
  patientId?: string;

  @IsOptional()
  @IsMongoId()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  medication?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  dosage?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsEnum(RouteOfAdmin)
  route?: RouteOfAdmin;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;
}