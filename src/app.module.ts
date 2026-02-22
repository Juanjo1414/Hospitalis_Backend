import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointment/appointment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI'); 
        if (!uri) {
          throw new Error('MONGO_URI is not defined');
        }
        return { uri };
      },
    }),

    UsersModule,
    AuthModule,
    PatientsModule,       
    AppointmentsModule,   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}