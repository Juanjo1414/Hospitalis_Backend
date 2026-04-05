import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  createMessage(@Req() req: any, @Body() dto: { receiverId: string; content: string }) {
    return this.messagesService.createMessage(req.user.userId, dto.receiverId, dto.content);
  }

  @Get('inbox')
  getInbox(@Req() req: any) {
    return this.messagesService.getInbox(req.user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.messagesService.getUnreadCount(req.user.userId);
  }

  @Get('conversation/:userId')
  getConversation(@Req() req: any, @Param('userId') otherUserId: string) {
    return this.messagesService.getConversation(req.user.userId, otherUserId);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id') messageId: string) {
    return this.messagesService.markAsRead(messageId, req.user.userId);
  }
}
