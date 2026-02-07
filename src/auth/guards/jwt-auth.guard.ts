import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard de autenticación JWT que extiende el AuthGuard de Passport
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}