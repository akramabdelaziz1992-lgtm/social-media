import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum ChannelType {
  WHATSAPP = 'whatsapp',
  MESSENGER = 'messenger',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
}

export enum ChannelStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
}

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: ChannelType;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  credentials: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 50,
    default: ChannelStatus.DISCONNECTED,
  })
  status: ChannelStatus;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @Column({ type: 'timestamp', nullable: true })
  lastConnectedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
