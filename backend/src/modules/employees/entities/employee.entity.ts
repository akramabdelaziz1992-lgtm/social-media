import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed password

  @Column()
  phone: string;

  @Column()
  department: string; // مبيعات، خدمة عملاء، دعم فني، إدارة

  @Column({ default: 'موظف' })
  role: string; // مدير، مشرف، موظف

  @Column({ default: 'نشط' })
  status: string; // نشط، غير نشط، إجازة

  @Column({ type: 'date' })
  hireDate: string;

  @Column({ type: 'int', default: 0 })
  totalAssignedChats: number;

  @Column({ type: 'int', default: 0 })
  todayChats: number;

  @Column({ nullable: true })
  responseTime: string; // Average response time

  @Column({ nullable: true })
  avatar: string;

  @Column('simple-array')
  permissions: string[]; // Array of permission strings

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations can be added later
  // @OneToMany(() => Conversation, conversation => conversation.assignedEmployee)
  // conversations: Conversation[];
}
