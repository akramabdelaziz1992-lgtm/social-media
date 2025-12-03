import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { firestore } from '../../config/firebase-admin.config';
import { FirebaseUser } from '../auth/auth.service.firebase';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

@Injectable()
export class UsersService {
  constructor() {}

  async findAll() {
    try {
      const usersSnapshot = await firestore.collection('users').get();
      const users = [];

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          uid: doc.id,
          username: userData.username,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          department: userData.department,
          isActive: userData.isActive,
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          permissions: userData.permissions || [],
          createdAt: userData.createdAt,
        });
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new BadRequestException('فشل جلب المستخدمين');
    }
  }

  async findOne(uid: string) {
    try {
      const userDoc = await firestore.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        throw new NotFoundException('المستخدم غير موجود');
      }

      const userData = userDoc.data();
      return {
        uid: userDoc.id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        isActive: userData.isActive,
        phone: userData.phone || '',
        avatar: userData.avatar || '',
        permissions: userData.permissions || [],
        createdAt: userData.createdAt,
      };
    } catch (error) {
      throw new NotFoundException('المستخدم غير موجود');
    }
  }

  async findByEmail(email: string) {
    try {
      const snapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        uid: userDoc.id,
        ...userData,
      };
    } catch (error) {
      return null;
    }
  }

  async findByUsername(username: string) {
    try {
      const snapshot = await firestore.collection('users').where('username', '==', username).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        uid: userDoc.id,
        ...userData,
      };
    } catch (error) {
      return null;
    }
  }

  async update(uid: string, updateData: Partial<FirebaseUser>, requestingUserId: string) {
    try {
      // التحقق من صلاحية المستخدم الذي يقوم بالتعديل
      const requestingUser = await this.findOne(requestingUserId);
      
      // فقط admin يمكنه تعديل المستخدمين
      if (requestingUser.role !== UserRole.ADMIN && requestingUserId !== uid) {
        throw new ForbiddenException('ليس لديك صلاحية تعديل هذا المستخدم');
      }

      // لا يمكن تعديل بعض الحقول
      const { uid: _, createdAt, passwordHash, ...allowedUpdates } = updateData as any;

      await firestore.collection('users').doc(uid).update({
        ...allowedUpdates,
        updatedAt: new Date().toISOString(),
      });

      return this.findOne(uid);
    } catch (error) {
      throw new BadRequestException('فشل تحديث المستخدم');
    }
  }

  async updatePassword(uid: string, newPassword: string, requestingUserId: string) {
    try {
      // التحقق من صلاحية المستخدم
      const requestingUser = await this.findOne(requestingUserId);
      
      // فقط admin أو المستخدم نفسه يمكنه تغيير كلمة المرور
      if (requestingUser.role !== UserRole.ADMIN && requestingUserId !== uid) {
        throw new ForbiddenException('ليس لديك صلاحية تغيير كلمة المرور');
      }

      // Hash كلمة المرور الجديدة
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await firestore.collection('users').doc(uid).update({
        passwordHash: hashedPassword,
        updatedAt: new Date().toISOString(),
      });

      return { message: 'تم تغيير كلمة المرور بنجاح' };
    } catch (error) {
      throw new BadRequestException('فشل تغيير كلمة المرور');
    }
  }

  async remove(uid: string, requestingUserId: string) {
    try {
      // التحقق من صلاحية المستخدم
      const requestingUser = await this.findOne(requestingUserId);
      
      // فقط admin يمكنه حذف المستخدمين
      if (requestingUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('ليس لديك صلاحية حذف المستخدمين');
      }

      // تعطيل المستخدم بدلاً من حذفه
      await firestore.collection('users').doc(uid).update({
        isActive: false,
        updatedAt: new Date().toISOString(),
      });

      return { message: 'تم تعطيل المستخدم بنجاح' };
    } catch (error) {
      throw new BadRequestException('فشل حذف المستخدم');
    }
  }

  async createEmployee(
    employeeData: {
      username: string;
      name: string;
      email: string;
      password: string;
      phone?: string;
      department?: string;
      role: UserRole;
      permissions?: string[];
    },
    requestingUserId: string,
  ) {
    try {
      // التحقق من صلاحية المستخدم
      const requestingUser = await this.findOne(requestingUserId);
      
      // فقط admin يمكنه إنشاء موظفين
      if (requestingUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('ليس لديك صلاحية إنشاء موظفين');
      }

      // التحقق من عدم وجود البريد مسبقاً
      const existingEmail = await this.findByEmail(employeeData.email);
      if (existingEmail) {
        throw new BadRequestException('البريد الإلكتروني مستخدم بالفعل');
      }

      // التحقق من عدم وجود username مسبقاً
      const existingUsername = await this.findByUsername(employeeData.username);
      if (existingUsername) {
        throw new BadRequestException('اسم المستخدم مستخدم بالفعل');
      }

      // Hash كلمة المرور
      const hashedPassword = await bcrypt.hash(employeeData.password, 10);

      // إنشاء الموظف
      const newEmployeeRef = await firestore.collection('users').add({
        username: employeeData.username,
        name: employeeData.name,
        email: employeeData.email,
        passwordHash: hashedPassword,
        role: employeeData.role,
        department: employeeData.department || 'support',
        phone: employeeData.phone || '',
        avatar: '',
        permissions: employeeData.permissions || ['listen_own_calls'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        uid: newEmployeeRef.id,
        username: employeeData.username,
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        department: employeeData.department || 'support',
        permissions: employeeData.permissions || ['listen_own_calls'],
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'فشل إنشاء الموظف');
    }
  }

  async updatePermissions(uid: string, permissions: string[], requestingUserId: string) {
    try {
      // التحقق من صلاحية المستخدم
      const requestingUser = await this.findOne(requestingUserId);
      
      // فقط admin يمكنه تعديل الصلاحيات
      if (requestingUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('ليس لديك صلاحية تعديل الصلاحيات');
      }

      await firestore.collection('users').doc(uid).update({
        permissions,
        updatedAt: new Date().toISOString(),
      });

      return this.findOne(uid);
    } catch (error) {
      throw new BadRequestException('فشل تحديث الصلاحيات');
    }
  }
}
