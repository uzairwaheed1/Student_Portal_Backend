import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async generateInvitationToken(userId: number): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours from now

    await this.userRepository.update(userId, {
      invitation_token: token,
      invitation_expires_at: expiresAt,
    });

    return token;
  }

  async sendInvitation(user: User, role: string): Promise<void> {
    const token = await this.generateInvitationToken(user.id);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const invitationLink = `${frontendUrl}/accept-invitation?token=${token}`;

    await this.emailService.sendInvitationEmail(
      user.email,
      user.name,
      role,
      invitationLink,
      '48 hours',
    );
  }

  async acceptInvitation(token: string, password: string): Promise<{ message: string; user: any }> {
    // Find user with this token
    const user = await this.userRepository.findOne({
      where: { invitation_token: token },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Invalid invitation token');
    }

    // Check if token expired
    if (!user.invitation_expires_at || new Date() > user.invitation_expires_at) {
      throw new BadRequestException('Invitation token has expired');
    }

    // Check if already accepted
    if (user.account_status === 'active' && user.password_hash) {
      throw new BadRequestException('Invitation already accepted');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await this.userRepository.update(user.id, {
      password_hash: hashedPassword,
      email_verified: true,
      account_status: 'active',
      invitation_token: undefined,
      invitation_expires_at: undefined,
    });

    return {
      message: 'Invitation accepted successfully. You can now login.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  async resendInvitation(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.account_status === 'active') {
      throw new BadRequestException('User account is already active');
    }

    await this.sendInvitation(user, user.role.name);

    return {
      message: 'Invitation email sent successfully',
    };
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: any; expired?: boolean }> {
    const user = await this.userRepository.findOne({
      where: { invitation_token: token },
      relations: ['role'],
    });

    if (!user) {
      return { valid: false };
    }

    if (!user.invitation_expires_at || new Date() > user.invitation_expires_at) {
      return { valid: false, expired: true };
    }

    return {
      valid: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }
}
