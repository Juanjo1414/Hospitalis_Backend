import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../../appointment/appointment.schema';

export class CreateAppointmentDto {
  @IsMongoId()
  patientId: string;

  @IsMongoId()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'startTime debe ser HH:MM' })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'endTime debe ser HH:MM' })
  endTime: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  room?: string;
}