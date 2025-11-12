import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = this.configService.get<number>('EMAIL_PORT');
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

    if (!emailHost || !emailUser || !emailPassword) {
      this.logger.warn('⚠️  Email configuration is incomplete. Email sending will be disabled.');
      this.logger.warn('Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in .env file');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      this.logger.log('✅ Email transporter configured successfully');
    } catch (error) {
      this.logger.error('❌ Failed to create email transporter:', error.message);
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email send.');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"OBE System" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
      });

      this.logger.log(`📧 Email sent successfully to ${options.to}`);
      this.logger.log(`Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${options.to}:`, error.message);
      return false;
    }
  }

  async sendInvitationEmail(
    to: string,
    name: string,
    role: string,
    invitationLink: string,
    expiresIn: string = '48 hours',
  ): Promise<boolean> {
    const subject = `Invitation to Join OBE System as ${role}`;
    const html = this.getInvitationTemplate(name, role, invitationLink, expiresIn);
    const text = `Hello ${name},\n\nYou have been invited to join the OBE System as ${role}.\n\nPlease click the following link to set your password and activate your account:\n${invitationLink}\n\nThis link will expire in ${expiresIn}.\n\nBest regards,\nOBE System Team`;

    return this.sendEmail({ to, subject, html, text });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationLink: string,
    expiresIn: string = '48 hours',
  ): Promise<boolean> {
    const subject = 'Verify Your Email - OBE System';
    const html = this.getVerificationTemplate(name, verificationLink, expiresIn);
    const text = `Hello ${name},\n\nThank you for registering with OBE System.\n\nPlease verify your email by clicking the following link:\n${verificationLink}\n\nThis link will expire in ${expiresIn}.\n\nBest regards,\nOBE System Team`;

    return this.sendEmail({ to, subject, html, text });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetLink: string,
    expiresIn: string = '1 hour',
  ): Promise<boolean> {
    const subject = 'Password Reset Request - OBE System';
    const html = this.getPasswordResetTemplate(name, resetLink, expiresIn);
    const text = `Hello ${name},\n\nWe received a request to reset your password.\n\nClick the following link to reset your password:\n${resetLink}\n\nThis link will expire in ${expiresIn}.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nOBE System Team`;

    return this.sendEmail({ to, subject, html, text });
  }

  private getInvitationTemplate(
    name: string,
    role: string,
    invitationLink: string,
    expiresIn: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #4CAF50; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to OBE System</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>You have been invited to join the <strong>Outcome-Based Education (OBE) Automation System</strong> as a <strong>${role}</strong>.</p>
            
            <p>To complete your registration and activate your account, please click the button below to set your password:</p>
            
            <center>
              <a href="${invitationLink}" class="button">Set Your Password</a>
            </center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #4CAF50;">${invitationLink}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This invitation link will expire in <strong>${expiresIn}</strong>. Please complete your registration before it expires.
            </div>
            
            <p>If you have any questions or didn't expect this invitation, please contact your system administrator.</p>
            
            <p>Best regards,<br>OBE System Team<br>Chemical Engineering Department</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2025 OBE Automation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVerificationTemplate(
    name: string,
    verificationLink: string,
    expiresIn: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #2196F3; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with the <strong>OBE Automation System</strong>!</p>
            
            <p>To complete your registration, please verify your email address by clicking the button below:</p>
            
            <center>
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #2196F3;">${verificationLink}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in <strong>${expiresIn}</strong>.
            </div>
            
            <p>If you didn't create an account, please ignore this email.</p>
            
            <p>Best regards,<br>OBE System Team<br>Chemical Engineering Department</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2025 OBE Automation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(
    name: string,
    resetLink: string,
    expiresIn: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #f44336; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background-color: #ffebee; padding: 10px; border-left: 4px solid #f44336; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your <strong>OBE System</strong> account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #f44336;">${resetLink}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This password reset link will expire in <strong>${expiresIn}</strong>. If you didn't request this reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>Best regards,<br>OBE System Team<br>Chemical Engineering Department</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2025 OBE Automation System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('Email transporter not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('✅ Email server connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('❌ Email server connection failed:', error.message);
      return false;
    }
  }
}
