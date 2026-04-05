import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Medication, MedicationSchema } from "./medication.schema";
import { MedicationsService } from "./medications.service";
import { MedicationsController } from "./medications.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Medication.name, schema: MedicationSchema }]),
  ],
  controllers: [MedicationsController],
  providers:   [MedicationsService],
  exports:     [MedicationsService],
})
export class MedicationsModule {}