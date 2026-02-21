import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Autenticar usuario — devuelve token + datos del médico para personalizar la UI
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub:       user['_id'],
      email:     user.email,
      fullName:  user.fullname,
      specialty: user.specialty ?? '',
      role:      user.role,
    };

    const token = this.jwtService.sign(payload);

    // Devolvemos también el objeto user sin contraseña para que el frontend
    // lo guarde en localStorage y personalice el Dashboard con datos reales
    return {
      accessToken: token,
      user: {
        fullName:  user.fullname,
        email:     user.email,
        specialty: user.specialty ?? '',
        role:      user.role,
      },
    };
  }

  // Registrar nuevo médico
  async register(registerDto: RegisterDto) {
    const { fullName, email, password, specialty } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con este correo');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      fullname:  fullName,
      email,
      password:  hashedPassword,
      specialty: specialty ?? '',
    });

    return {
      message: 'Usuario registrado exitosamente',
      userId: user['_id'],
    };
  }

  // Solicitar restablecimiento de contraseña
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Por seguridad respondemos igual aunque el correo no exista
      return { message: 'Si el correo existe, recibirás las instrucciones.' };
    }

    // TODO Sprint 3: generar token y enviar email con Nodemailer/SendGrid
    return {
      message: 'Correo de recuperación enviado exitosamente',
    };
  }
}