import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChannelType } from '../../channels/entities/channel.entity';
import { Channel } from '../../channels/entities/channel.entity';
import { MediaItem } from '../../messages/entities/message.entity';

export interface TemplateVariable {
  name: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  channelType: ChannelType;

  @Column({ type: 'uuid', nullable: true })
  channelId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  variables: TemplateVariable[];

  @Column({ type: 'text', nullable: true })
  mediaLayout: MediaItem[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Channel, { nullable: true })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;
}
