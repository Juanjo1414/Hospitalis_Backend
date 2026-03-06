import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { RecordType, RecordStatus } from '../../medical-records/medical-record.schema';

export class CreateMedicalRecordDto {
  // ── Relaciones ──────────────────────────────────────────
  @IsMongoId({ message: 'patientId must be a valid MongoDB ID' })
  @IsNotEmpty()
  patientId: string;

  @IsMongoId({ message: 'doctorId must be a valid MongoDB ID' })
  @IsNotEmpty()
  doctorId: string;

  @IsOptional()
  @IsMongoId({ message: 'appointmentId must be a valid MongoDB ID' })
  appointmentId?: string;

  // ── Clasificación ────────────────────────────────────────
  @IsEnum(RecordType, {
    message: `type must be one of: ${Object.values(RecordType).join(', ')}`,
  })
  @IsNotEmpty()
  type: RecordType;

  @IsOptional()
  @IsEnum(RecordStatus, {
    message: `status must be one of: ${Object.values(RecordStatus).join(', ')}`,
  })
  status?: RecordStatus;

  // ── Contenido principal ──────────────────────────────────
  @IsString()
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'description is required' })
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  icdCode?: string;

  // ── Signos vitales (opcional) ─────────────────────────────
  @IsOptional()
  @IsObject()
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };

  // ── Resultado de laboratorio (opcional) ──────────────────
  @IsOptional()
  @IsObject()
  labResult?: {
    testName?: string;
    result?: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
  };

  // ── Adjuntos y metadatos ──────────────────────────────────
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsDateString()
  recordDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}