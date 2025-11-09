import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  getAdminDashboard() {
    return 'Welcome Admin!';
  }

  @Get('faculty/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Faculty')
  getFacultyDashboard() {
    return 'Welcome Faculty!';
  }

  @Get('student/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Student')
  getStudentDashboard() {
    return 'Welcome Student!';
  }
}
