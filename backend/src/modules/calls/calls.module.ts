import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { TwilioService } from './twilio.service';
import { SoftphoneController } from './softphone.controller';
import { TestTwilioController } from './test-twilio.controller';
import { Call } from './entities/call.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Call])],
  controllers: [CallsController, SoftphoneController, TestTwilioController],
  providers: [CallsService, TwilioService],
  exports: [CallsService, TwilioService],
})
export class CallsModule {}
