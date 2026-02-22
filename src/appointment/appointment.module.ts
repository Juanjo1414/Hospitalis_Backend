import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsController } from './appointment.controller';
import { AppointmentsService } from './appointment.service';
import { Appointment, AppointmentSchema } from './appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}