import { Controller, Get } from '@nestjs/common';

@Controller('patients')
export class PatientsController {
    @Get()
    findAll(){
        return {message : 'patients controller working'}
    }
}
