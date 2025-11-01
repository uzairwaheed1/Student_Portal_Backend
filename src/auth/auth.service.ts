import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Hardcoded demo credentials
  private readonly users = {
    admin: {
      email: 'admin@portal.com',
      password: 'admin123',
      role: 'Admin',
      userId: 'admin-001',
    },
    faculty: {
      email: 'faculty@portal.com',
      password: 'faculty123',
      role: 'Faculty',
      userId: 'faculty-001',
    },
    student: {
      email: 'student@portal.com',
      password: 'student123',
      role: 'Student',
      userId: 'student-001',
    },
  };

  validateUser(email: string, password: string, role: string) {
    const user = Object.values(this.users).find(
      (u) => u.email === email && u.role === role,
    );

    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  login(loginDto: LoginDto, role: string) {
    const user = this.validateUser(loginDto.email, loginDto.password, role);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    };
  }
}
