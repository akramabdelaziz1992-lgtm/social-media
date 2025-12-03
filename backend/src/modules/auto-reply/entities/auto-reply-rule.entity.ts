import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Channel, ChannelType } from '../../channels/entities/channel.entity';
import { Template } from '../../templates/entities/template.entity';
import { UserDepartment } from '../../users/entities/user.entity';

export enum TriggerType {
  KEYWORD = 'keyword',
  FIRST_CONTACT = 'first_contact',
  TIME_BASED = 'time_based',
  UNASSIGNED = 'unassigned',
  OUTSIDE_HOURS = 'outside_hours',
}

export interface TriggerCondition {
  type: TriggerType;
  keywords?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  delayMinutes?: number;
  metadata?: Record<string, any>;
}

@Entity('auto_reply_rules')
export class AutoReplyRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  channelId: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  channelType: ChannelType;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  department: UserDepartment;

  @Column({ type: 'text' })
  triggers: TriggerCondition[];

  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({ default: 0 })
  executionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Channel, { nullable: true })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @ManyToOne(() => Template, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: Template;
}
