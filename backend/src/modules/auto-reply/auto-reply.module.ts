import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoReplyRule } from './entities/auto-reply-rule.entity';
import { AutoReplyController } from './auto-reply.controller';
import { AutoReplyService } from './auto-reply.service';

@Module({
  imports: [TypeOrmModule.forFeature([AutoReplyRule])],
  controllers: [AutoReplyController],
  providers: [AutoReplyService],
  exports: [AutoReplyService],
})
export class AutoReplyModule {}
