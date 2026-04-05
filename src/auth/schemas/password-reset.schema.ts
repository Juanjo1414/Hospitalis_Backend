/**
 * PasswordResetToken Schema
 *
 * Guarda los tokens de recuperación de contraseña.
 * Cada vez que un usuario pide recuperar su contraseña,
 * se crea un documento aquí con:
 *   - token único (UUID)
 *   - referencia al usuario
 *   - fecha de expiración (1 hora)
 *   - si ya fue usado
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordResetTokenDocument = PasswordResetToken & Document;

@Schema({ timestamps: true })
export class PasswordResetToken {

  // El token único que va en el enlace del email
  // Ejemplo: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  @Prop({ required: true, unique: true })
  token!: string;

  // Referencia al usuario dueño del token
  // Types.ObjectId es el tipo de ID de MongoDB
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  // Cuándo expira el token
  // El backend calcula: ahora + 1 hora
  @Prop({ required: true })
  expiresAt!: Date;

  // Si el token ya fue utilizado para resetear la contraseña
  // Una vez usado, no puede volver a usarse (seguridad)
  @Prop({ default: false })
  used!: boolean;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);