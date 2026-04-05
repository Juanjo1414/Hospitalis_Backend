import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private usersService: UsersService,
  ) {}

  async createMessage(senderId: string, receiverId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }
    if (senderId === receiverId) {
      throw new BadRequestException('No puedes enviarte un mensaje a ti mismo');
    }
    
    // Validar que el receptor exista
    await this.usersService.findOne(receiverId);

    const newMessage = new this.messageModel({
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      content,
    });
    return newMessage.save();
  }

  async getInbox(userId: string) {
    const objId = new Types.ObjectId(userId);
    // Para simplificar, buscamos todos los mensajes del usuario ordenados descendentemente
    const messages = await this.messageModel
      .find({ $or: [{ sender: objId }, { receiver: objId }] })
      .sort({ createdAt: -1 })
      .populate('sender', 'fullname email')
      .populate('receiver', 'fullname email')
      .lean();

    // Agrupar por conversación
    const conversationsMap = new Map<string, any>();

    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      const otherUserId = otherUser._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUser,
          lastMessage: {
            _id: msg._id,
            content: msg.content,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
            senderId: msg.sender._id.toString()
          },
          unreadCount: 0 // Si queremos contar no leídos en esa convesación en específico lo hacemos aquí
        });
      }

      // Si el mensaje es recibido y no está leído, aumentamos el contador general de esa conversación
      if (msg.receiver._id.toString() === userId && !msg.isRead) {
        conversationsMap.get(otherUserId).unreadCount += 1;
      }
    }

    return Array.from(conversationsMap.values());
  }

  async getConversation(userId: string, otherUserId: string) {
    const userObj = new Types.ObjectId(userId);
    const otherObj = new Types.ObjectId(otherUserId);

    // Marcar como leídos los mensajes que otherUser envió y userId recibe
    await this.messageModel.updateMany(
      { sender: otherObj, receiver: userObj, isRead: false },
      { $set: { isRead: true } }
    );

    return this.messageModel
      .find({
        $or: [
          { sender: userObj, receiver: otherObj },
          { sender: otherObj, receiver: userObj },
        ],
      })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullname email _id')
      .populate('receiver', 'fullname email _id')
      .lean();
  }

  async markAsRead(messageId: string, userId: string) {
    const m = await this.messageModel.findOneAndUpdate(
      { _id: new Types.ObjectId(messageId), receiver: new Types.ObjectId(userId) },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!m) throw new NotFoundException('Mensaje no encontrado o no autorizado');
    return m;
  }

  async getUnreadCount(userId: string) {
    const count = await this.messageModel.countDocuments({
      receiver: new Types.ObjectId(userId),
      isRead: false
    });
    return { count };
  }
}
