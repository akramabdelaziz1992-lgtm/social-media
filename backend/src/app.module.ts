import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { AutoReplyModule } from './modules/auto-reply/auto-reply.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { StorageModule } from './modules/storage/storage.module';
import { AuditModule } from './modules/audit/audit.module';
import { CallsModule } from './modules/calls/calls.module';
import { AIModule } from './modules/ai/ai.module';
import { EmployeesModule } from './modules/employees/employees.module';

// Import all entities explicitly
import { User } from './modules/users/entities/user.entity';
import { Channel } from './modules/channels/entities/channel.entity';
import { Conversation } from './modules/conversations/entities/conversation.entity';
import { Message } from './modules/messages/entities/message.entity';
import { Template } from './modules/templates/entities/template.entity';
import { AutoReplyRule } from './modules/auto-reply/entities/auto-reply-rule.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';
import { Call } from './modules/calls/entities/call.entity';
import { Employee } from './modules/employees/entities/employee.entity';
import { Department } from './modules/employees/entities/department.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - PostgreSQL for production, SQLite for development
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        const isPostgres = databaseUrl && databaseUrl.startsWith('postgresql://');

        if (isPostgres) {
          // PostgreSQL for Production (Render)
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Channel, Conversation, Message, Template, AutoReplyRule, AuditLog, Call, Employee, Department],
            synchronize: true, // ⚠️ Set to false in production after first deployment
            logging: !isProd,
            ssl: isProd ? { rejectUnauthorized: false } : false,
          };
        } else {
          // SQLite for Development
          return {
            type: 'better-sqlite3',
            database: databaseUrl || './data/almasar.db',
            entities: [User, Channel, Conversation, Message, Template, AutoReplyRule, AuditLog, Call, Employee, Department],
            synchronize: true,
            logging: !isProd,
          };
        }
      },
      inject: [ConfigService],
    }),

    // Redis & BullMQ (Optional - disabled for SQLite testing without Docker)
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     connection: {
    //       host: configService.get('REDIS_HOST'),
    //       port: configService.get('REDIS_PORT'),
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),

    // Feature modules
    AuthModule,
    UsersModule,
    ChannelsModule,
    ConversationsModule,
    MessagesModule,
    TemplatesModule,
    AutoReplyModule,
    WebhooksModule,
    GatewayModule,
    StorageModule,
    AuditModule,
    AIModule,
    CallsModule,
    EmployeesModule,
  ],
})
export class AppModule {}
