import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { firestore, auth as firebaseAuth } from '../../config/firebase-admin.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface FirebaseUser {
  uid: string;
  username: string;
  email: string;
  name: string;
  role: string;
  department: string;
  phone?: string;
  avatar?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: any;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<FirebaseUser | null> {
    try {
      // البحث عن المستخدم في Firestore بواسطة username
      const usersRef = firestore.collection('users');
      const snapshot = await usersRef.where('username', '==', username).where('isActive', '==', true).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data() as FirebaseUser;
      
      // التحقق من كلمة المرور
      const isPasswordValid = await bcrypt.compare(password, userData['passwordHash']);
      if (!isPasswordValid) {
        return null;
      }

      return {
        uid: userDoc.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        avatar: userData.avatar,
        permissions: userData.permissions || [],
        isActive: userData.isActive,
        createdAt: userData.createdAt,
      };
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // إنشاء Firebase Custom Token
    const customToken = await firebaseAuth.createCustomToken(user.uid, {
      role: user.role,
      department: user.department,
      permissions: user.permissions,
    });

    return {
      accessToken: customToken,
      user: {
        uid: user.uid,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        phone: user.phone,
        permissions: user.permissions || [],
      },
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      // التحقق من عدم وجود البريد الإلكتروني
      const usersRef = firestore.collection('users');
      const emailSnapshot = await usersRef.where('email', '==', registerDto.email).limit(1).get();
      
      if (!emailSnapshot.empty) {
        throw new UnauthorizedException('البريد الإلكتروني مستخدم بالفعل');
      }

      // التحقق من عدم وجود username
      const usernameSnapshot = await usersRef.where('username', '==', registerDto.username).limit(1).get();
      
      if (!usernameSnapshot.empty) {
        throw new UnauthorizedException('اسم المستخدم مستخدم بالفعل');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // إنشاء المستخدم في Firestore
      const newUserRef = await usersRef.add({
        username: registerDto.username,
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
        role: 'employee', // Default role
        department: registerDto.department || 'support',
        phone: registerDto.phone || '',
        avatar: '',
        permissions: ['listen_own_calls'], // Default permission
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // إنشاء Custom Token للمستخدم الجديد
      const customToken = await firebaseAuth.createCustomToken(newUserRef.id);

      return {
        accessToken: customToken,
        user: {
          uid: newUserRef.id,
          username: registerDto.username,
          name: registerDto.name,
          email: registerDto.email,
          role: 'employee',
          department: registerDto.department || 'support',
          permissions: ['listen_own_calls'],
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new UnauthorizedException(error.message || 'حدث خطأ أثناء التسجيل');
    }
  }

  async refreshToken(userId: string) {
    try {
      // الحصول على بيانات المستخدم
      const userDoc = await firestore.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new UnauthorizedException('المستخدم غير موجود');
      }

      const userData = userDoc.data() as FirebaseUser;

      // إنشاء Custom Token جديد
      const customToken = await firebaseAuth.createCustomToken(userId, {
        role: userData.role,
        department: userData.department,
        permissions: userData.permissions,
      });

      return {
        accessToken: customToken,
      };
    } catch (error) {
      throw new UnauthorizedException('فشل تحديث الجلسة');
    }
  }
}
