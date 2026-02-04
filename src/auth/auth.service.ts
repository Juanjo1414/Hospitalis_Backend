import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  //Constructor que inyecta el UsersService
  constructor(private readonly usersService: UsersService) {}

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
}
