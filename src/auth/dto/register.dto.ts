import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  fullName: string;

  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  // Especialidad médica — opcional en el registro
  @IsOptional()
  @IsString()
  specialty?: string;
}