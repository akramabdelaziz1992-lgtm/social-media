import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  SALES = 'sales',
  RESERVATIONS = 'reservations',
  ACCOUNTING = 'accounting',
}

export enum UserDepartment {
  SALES = 'sales',
  RESERVATIONS = 'reservations',
  ACCOUNTING = 'accounting',
  MANAGEMENT = 'management',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.SALES,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  department: UserDepartment;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'simple-json', nullable: true })
  permissions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
