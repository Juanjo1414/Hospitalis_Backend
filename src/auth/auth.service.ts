import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  //Constructor que inyecta el UsersService
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  //Método para autenticar a un usuario
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales Invalidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales Invalidas');
    }

    const payload = {
      sub: user['_id'],
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
    };
  }

  //Método para registrar un nuevo usuario
  async register(registerDto: RegisterDto) {
    const { fullName, email, password } = registerDto;

    //Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Credenciales Invalidas');
    }

    //Crear el usuario con la contraseña hasheada
    const hashedPassword = await bcrypt.hash(password, 10);

    //Crear el nuevo usuario en la base de datos
    const user = await this.usersService.create({
      fullname: fullName,
      email,
      password: hashedPassword,
    });

    //Retornar una respuesta exitosa
    return {
      message: 'Usuario registrado exitosamente',
      userId: user['_id'],
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Este correo ya existe, intente con otro');
    }

    // Aquí se implementaría la lógica para generar un token de recuperación y enviar el correo electrónico al usuario
    return {
      message: 'Correo de recuperación enviado exitosamente',
    };
  }
}
