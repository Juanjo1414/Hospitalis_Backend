import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './user.schema';

export interface UserListItem {
  _id: string;
  fullname: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Buscar por email (usado por AuthService)
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  // Crear usuario (usado por AuthService en /register)
  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  // ── GESTIÓN DE USUARIOS (solo Admin) ──────────────────────────────────────

  // Listar todos los usuarios (sin exponer password)
  async findAll(query?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: UserListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query?.role !== undefined && query.role !== '')
      filter.role = query.role;
    if (query?.isActive !== undefined) filter.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password') // nunca exponer el hash
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);

    return { data: data as unknown as UserListItem[], total, page, limit };
  }

  // Obtener un usuario por ID (sin password)
  async findOne(id: string): Promise<UserListItem> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user as unknown as UserListItem;
  }

  // Actualizar usuario (nombre, rol, isActive, password opcional)
  async update(
    id: string,
    dto: {
      fullname?: string;
      email?: string;
      role?: UserRole;
      isActive?: boolean;
      password?: string;
    },
  ): Promise<UserListItem> {
    // Si viene email nuevo, verificar que no exista ya
    if (dto.email) {
      const existing = await this.userModel.findOne({ email: dto.email });
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException('El correo ya está en uso');
      }
    }

    // Hashear password si se está actualizando
    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .select('-password');

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user as unknown as UserListItem;
  }

  // Eliminar usuario (soft delete: isActive = false)
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true },
    );
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario desactivado exitosamente' };
  }

  // Eliminar permanentemente (hard delete)
  async hardDelete(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario eliminado permanentemente' };
  }

  // --Metodo de Forgot Password para actualizar contraseña sin necesidad de hashear (solo lo llama AuthService)--
  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: { password: hashedPassword },
    });
  }
}
