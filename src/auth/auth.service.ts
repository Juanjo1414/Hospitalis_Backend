/**
 * AuthService
 *
 * Maneja login, registro, recuperación de contraseña y reset.
 *
 * Conceptos clave que aprenderás aquí:
 * - UUID: identificador único universal, ideal para tokens seguros
 * - Nodemailer: librería para enviar emails desde Node.js
 * - Transporter: el "cliente de correo" configurado con SMTP
 * - Token de un solo uso: se invalida al ser utilizado
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; // módulo nativo de Node — genera UUIDs
import * as nodemailer from 'nodemailer'; // envío de emails
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from './schemas/password-reset.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    // Inyectamos el modelo de PasswordResetToken para poder
    // crear, buscar y actualizar tokens en MongoDB
    @InjectModel(PasswordResetToken.name)
    private readonly resetTokenModel: Model<PasswordResetTokenDocument>,
  ) {}

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new BadRequestException('Credenciales inválidas');

    const payload = {
      sub: user['_id'],
      email: user.email,
      role: user.role,
      fullName: user.fullname,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────
  async register(registerDto: RegisterDto) {
    const { fullName, email, password } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new BadRequestException('Credenciales inválidas');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      fullname: fullName,
      email,
      password: hashedPassword,
    });

    return { message: 'Usuario registrado exitosamente', userId: user['_id'] };
  }

  // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
  //
  // Buena práctica de seguridad: siempre retornamos el MISMO mensaje,
  // sin importar si el email existe o no. Así un atacante no puede
  // usar este endpoint para descubrir qué emails están registrados.
  //
  async forgotPassword(email: string): Promise<{ message: string }> {
    const GENERIC_RESPONSE = {
      message:
        'Si el correo está registrado, recibirás un enlace de recuperación.',
    };

    // Buscar usuario — si no existe, retornar mensaje genérico silenciosamente
    const user = await this.usersService.findByEmail(email);
    if (!user) return GENERIC_RESPONSE;

    // Invalidar tokens anteriores del mismo usuario que no hayan sido usados
    // Esto evita que haya múltiples tokens válidos al mismo tiempo
    await this.resetTokenModel.updateMany(
      { userId: user['_id'], used: false },
      { $set: { used: true } },
    );

    // Generar token único con crypto (módulo nativo de Node.js)
    // randomUUID() genera un UUID v4: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    // Es criptográficamente seguro — prácticamente imposible de adivinar
    const token = crypto.randomUUID();

    // Calcular expiración: ahora + 1 hora
    // Date.now() retorna milisegundos, 60*60*1000 = 1 hora en ms
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Guardar el token en MongoDB
    await this.resetTokenModel.create({
      token,
      userId: user['_id'],
      expiresAt,
      used: false,
    });

    // Construir el enlace que irá en el email
    // FRONTEND_URL viene del .env → "http://localhost:5173"
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Enviar el email
    await this.sendResetEmail(email, user['fullname'], resetLink);

    return GENERIC_RESPONSE;
  }

  // ── RESET PASSWORD ─────────────────────────────────────────────────────────
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // 1. Buscar el token en la BD
    const resetToken = await this.resetTokenModel.findOne({ token });

    // 2. Validaciones de seguridad:
    if (!resetToken)
      throw new BadRequestException('Token inválido o inexistente');
    if (resetToken.used)
      throw new BadRequestException('Este enlace ya fue utilizado');
    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException(
        'El enlace ha expirado. Solicita uno nuevo',
      );
    }

    // 3. Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar la contraseña del usuario en la BD
    await this.usersService.updatePassword(
      String(resetToken.userId),
      hashedPassword,
    );

    // 5. Marcar el token como usado para que no pueda reutilizarse
    await this.resetTokenModel.findByIdAndUpdate(resetToken._id, {
      $set: { used: true },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  // ── HELPER: Enviar email con Nodemailer ────────────────────────────────────
  //
  // ¿Qué es un transporter?
  // Es el "cliente de correo" de Nodemailer — contiene la configuración
  // SMTP (servidor, puerto, credenciales). Se crea una vez por envío.
  //
  private async sendResetEmail(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    // Crear el transporter con las credenciales de Mailtrap del .env
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILTRAP_HOST'),
      port: this.configService.get<number>('MAILTRAP_PORT'),
      auth: {
        user: this.configService.get<string>('MAILTRAP_USER'),
        pass: this.configService.get<string>('MAILTRAP_PASS'),
      },
    });

    // Definir el email: remitente, destinatario, asunto y cuerpo HTML
    await transporter.sendMail({
      from: `"Hospitalis" <${this.configService.get('MAIL_FROM')}>`,
      to,
      subject: 'Recuperación de contraseña — Hospitalis',
      // El cuerpo HTML hace el email visualmente presentable
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f6f7f8; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #137fec; border-radius: 10px;">
              <span style="color: white; font-size: 24px; font-weight: 900;">+</span>
            </div>
            <h2 style="color: #0f172a; margin: 12px 0 4px;">Hospitalis</h2>
          </div>

          <div style="background: white; border-radius: 10px; padding: 28px;">
            <h3 style="color: #0f172a; margin-top: 0;">Hola, ${name}</h3>
            <p style="color: #475569; line-height: 1.6;">
              Recibimos una solicitud para recuperar la contraseña de tu cuenta en Hospitalis.
              Haz clic en el botón para crear una nueva contraseña:
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}"
                style="display: inline-block; background: #137fec; color: white;
                       padding: 12px 32px; border-radius: 8px; text-decoration: none;
                       font-weight: 600; font-size: 15px;">
                Restablecer contraseña
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
              ⏱️ Este enlace expira en <strong>1 hora</strong>.<br/>
              🔒 Si no solicitaste este cambio, puedes ignorar este mensaje.<br/>
              🚫 El enlace solo puede usarse una vez.
            </p>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;"/>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              O copia y pega este enlace en tu navegador:<br/>
              <span style="color: #137fec; word-break: break-all;">${resetLink}</span>
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} Hospitalis Systems. Todos los derechos reservados.
          </p>
        </div>
      `,
    });
  }
}
