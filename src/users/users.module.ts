import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import {User, UserSchema} from './user.schema';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([  //Se importa el esquema del usuario
      { name: User.name, schema: UserSchema }, 
    ]),
  ],
  providers: [UsersService],  //Se provee el servicio de usuarios
  exports: [UsersService], controllers: [UsersController],    //Se exporta el servicio de usuarios para su uso en otros módulos
})
export class UsersModule {}
