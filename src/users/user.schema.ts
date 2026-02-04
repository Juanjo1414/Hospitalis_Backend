import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;  //Tipo de documento de Mongoose para el usuario

export enum UserRole {  //Definición de roles de usuario
  ADMIN = 'admin',
  MEDICO = 'medico',
}

@Schema({ timestamps: true })  //Decorador de esquema de Mongoose con marcas de tiempo
export class User {
  @Prop({ required: true })
  fullname: string;

  @Prop({  //Propiedad de correo electrónico con validaciones
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true }) //Propiedad de contraseña
  password: string;

  @Prop({  //Propiedad de rol con valores enumerados
    type: String,
    enum: UserRole,
    default: UserRole.MEDICO,
  })
  role: UserRole;

  @Prop({ default: true }) //Propiedad para estado activo/inactivo
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);  //Creación del esquema de Mongoose a partir de la clase User
