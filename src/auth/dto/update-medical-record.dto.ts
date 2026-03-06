import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalRecordDto } from './create-medical-record.dto';
import { OmitType } from '@nestjs/mapped-types';

// Permite actualizar todos los campos excepto patientId y doctorId (son inmutables)
export class UpdateMedicalRecordDto extends PartialType(
  OmitType(CreateMedicalRecordDto, ['patientId', 'doctorId'] as const),
) {}