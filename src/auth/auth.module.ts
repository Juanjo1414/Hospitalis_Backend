/**
 * AuthModule
 *
 * Ahora importa MongooseModule para registrar el schema PasswordResetToken.
 * Esto permite que AuthService pueda inyectar el modelo con @InjectModel.
 *
 * Concepto clave: en NestJS, cada módulo debe declarar explícitamente
 * qué schemas/modelos de Mongoose usa. Si no lo registras aquí,
 * el @InjectModel del service lanzará un error al iniciar.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset.schema';

@Module({
  imports: [
    UsersModule,

    // Registrar el schema de PasswordResetToken en este módulo
    // Esto crea la colección "passwordresettokens" en MongoDB automáticamente
    MongooseModule.forFeature([
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<number>('JWT_EXPIRES_IN') ?? 3600,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}