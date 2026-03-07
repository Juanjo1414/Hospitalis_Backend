import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // POST /auth/register
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // POST /auth/forgot-password
  // Body: { email: string }
  // Genera el token y envía el email. Siempre retorna el mismo mensaje
  // (no revela si el email existe o no — buena práctica de seguridad)
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // POST /auth/reset-password
  // Body: { token: string, newPassword: string }
  // Valida el token y actualiza la contraseña
  @Post('reset-password')
  resetPassword(
    @Body('token')       token:       string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}