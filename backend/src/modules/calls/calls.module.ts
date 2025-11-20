import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { TwilioService } from './twilio.service';
import { Call } from './entities/call.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Call])],
  controllers: [CallsController],
  providers: [CallsService, TwilioService],
  exports: [CallsService, TwilioService],
})
export class CallsModule {}
