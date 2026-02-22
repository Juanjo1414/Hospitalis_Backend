import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';

// Todos los campos de CreatePatientDto se vuelven opcionales para el PATCH
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}