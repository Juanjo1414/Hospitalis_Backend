import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';

// DTO para el registro de usuarios, con validaciones de nombre completo, correo electrónico y contraseña
export class RegisterDto {
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;
}