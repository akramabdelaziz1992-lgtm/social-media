import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BUSY = 'busy',
  NO_ANSWER = 'no-answer',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'twilio_call_sid', unique: true })
  twilioCallSid: string;

  @Column({ name: 'from_number' })
  fromNumber: string;

  @Column({ name: 'to_number', nullable: true })
  toNumber: string;

  @Column({
    type: 'varchar',
    default: CallDirection.INBOUND,
  })
  direction: CallDirection;

  @Column({
    type: 'varchar',
    default: CallStatus.INITIATED,
  })
  status: CallStatus;

  @Column({ name: 'duration_seconds', nullable: true, default: 0 })
  durationSeconds: number;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ name: 'recording_sid', nullable: true })
  recordingSid: string;

  @Column({ name: 'recording_duration', nullable: true, default: 0 })
  recordingDuration: number;

  @Column({ name: 'agent_id', nullable: true })
  agentId: string;

  @Column({ name: 'agent_name', nullable: true })
  agentName: string;

  @Column({ name: 'customer_name', nullable: true })
  customerName: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;
}
