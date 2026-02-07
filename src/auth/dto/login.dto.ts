import { IsEmail, IsNotEmpty } from 'class-validator';

// DTO para el login de usuarios, con validaciones de correo electrónico y contraseña
export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
