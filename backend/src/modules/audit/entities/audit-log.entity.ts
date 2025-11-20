import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  // Auth
  LOGIN = 'login',
  LOGOUT = 'logout',
  
  // Conversations
  CONVERSATION_CREATE = 'conversation_create',
  CONVERSATION_ASSIGN = 'conversation_assign',
  CONVERSATION_TRANSFER = 'conversation_transfer',
  CONVERSATION_CLOSE = 'conversation_close',
  CONVERSATION_REOPEN = 'conversation_reopen',
  
  // Messages
  MESSAGE_SEND = 'message_send',
  MESSAGE_EDIT = 'message_edit',
  MESSAGE_DELETE = 'message_delete',
  
  // Channels
  CHANNEL_CREATE = 'channel_create',
  CHANNEL_UPDATE = 'channel_update',
  CHANNEL_CONNECT = 'channel_connect',
  CHANNEL_DISCONNECT = 'channel_disconnect',
  
  // Users
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  
  // Templates
  TEMPLATE_CREATE = 'template_create',
  TEMPLATE_UPDATE = 'template_update',
  TEMPLATE_DELETE = 'template_delete',
  
  // Auto Reply
  AUTO_REPLY_EXECUTE = 'auto_reply_execute',
  AUTO_REPLY_CREATE = 'auto_reply_create',
  AUTO_REPLY_UPDATE = 'auto_reply_update',
}

export enum TargetType {
  CONVERSATION = 'conversation',
  MESSAGE = 'message',
  CHANNEL = 'channel',
  USER = 'user',
  TEMPLATE = 'template',
  AUTO_REPLY_RULE = 'auto_reply_rule',
}

@Entity('audit_logs')
@Index(['actorUserId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actorUserId: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  action: AuditAction;

  @Column({
    type: 'varchar',
    length: 100,
  })
  targetType: TargetType;

  @Column({ type: 'uuid' })
  targetId: string;

  @Column({ type: 'text', nullable: true })
  changes: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actorUserId' })
  actor: User;
}
