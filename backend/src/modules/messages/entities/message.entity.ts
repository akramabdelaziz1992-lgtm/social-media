import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { User } from '../../users/entities/user.entity';

export enum SenderType {
  USER = 'user',
  CUSTOMER = 'customer',
  BOT = 'bot',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  VOICE = 'voice',
  STICKER = 'sticker',
  LOCATION = 'location',
}

export interface MediaItem {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
  filename?: string;
  caption?: string;
  metadata?: Record<string, any>;
}

@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  senderType: SenderType;

  @Column({ type: 'uuid', nullable: true })
  senderId: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'text', nullable: true })
  media: MediaItem[];

  @Column({
    type: 'varchar',
    length: 50,
    default: MessageStatus.SENDING,
  })
  status: MessageStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalMessageId: string;

  @Column({ type: 'text', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isAutoReply: boolean;

  @Column({ type: 'uuid', nullable: true })
  replyToMessageId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'replyToMessageId' })
  replyToMessage: Message;
}
