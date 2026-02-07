import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';

// Controlador de usuarios con un endpoint protegido que devuelve el perfil del usuario autenticado
@Controller('users')
export class UsersController {

    // Endpoint protegido que devuelve el perfil del usuario autenticado
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req) {
        return req.user;
    }
}
