import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { MedicationStatus } from '../../medications/medication.schema';

export class CreateMedicationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  defaultUnit?: string;

  @IsOptional()
  @IsEnum(MedicationStatus)
  status?: MedicationStatus;
}

export class UpdateMedicationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  defaultUnit?: string;

  @IsOptional()
  @IsEnum(MedicationStatus)
  status?: MedicationStatus;
}