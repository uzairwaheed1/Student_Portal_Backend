import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

class TestEmailDto {
  email: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Test email configuration (only for SuperAdmin)
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  async testEmail(@Body() dto: TestEmailDto) {
    const isConnected = await this.emailService.testConnection();
    
    if (!isConnected) {
      return {
        success: false,
        message: 'Email server connection failed',
      };
    }

    const sent = await this.emailService.sendEmail({
      to: dto.email,
      subject: 'Test Email from OBE System',
      html: '<h1>Email Configuration Successful!</h1><p>Your email service is working correctly.</p>',
      text: 'Email Configuration Successful! Your email service is working correctly.',
    });

    return {
      success: sent,
      message: sent ? 'Test email sent successfully' : 'Failed to send test email',
    };
  }

  // Test invitation email
  @Post('test-invitation')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  async testInvitation(@Body() dto: TestEmailDto) {
    const sent = await this.emailService.sendInvitationEmail(
      dto.email,
      'Test User',
      'Admin',
      'http://localhost:3000/accept-invitation?token=test-token-123',
      '48 hours',
    );

    return {
      success: sent,
      message: sent ? 'Invitation email sent successfully' : 'Failed to send invitation email',
    };
  }
}