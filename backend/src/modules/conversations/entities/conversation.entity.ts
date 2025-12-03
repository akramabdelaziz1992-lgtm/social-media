import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Channel } from '../../channels/entities/channel.entity';
import { User, UserDepartment } from '../../users/entities/user.entity';

export enum PrivacyScope {
  PRIVATE = 'private',
  SHARED = 'shared',
  DEPARTMENT = 'department',
}

export enum ConversationStatus {
  OPEN = 'open',
  PENDING = 'pending',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Entity('conversations')
@Index(['channelId', 'externalThreadId'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  channelId: string;

  @Column({ length: 255 })
  externalThreadId: string;

  @Column({ type: 'uuid', nullable: true })
  assignedToUserId: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  department: UserDepartment;

  @Column({ type: 'text' })
  customerProfile: {
    name?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    platform?: string;
    platformId?: string;
    metadata?: Record<string, any>;
  };

  @Column({
    type: 'varchar',
    length: 50,
    default: PrivacyScope.PRIVATE,
  })
  privacyScope: PrivacyScope;

  @Column({
    type: 'varchar',
    length: 50,
    default: ConversationStatus.OPEN,
  })
  status: ConversationStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstResponseAt: Date;

  @Column({ default: 0 })
  unreadCount: number;

  @Column({ type: 'text', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Channel)
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToUserId' })
  assignedUser: User;
}
