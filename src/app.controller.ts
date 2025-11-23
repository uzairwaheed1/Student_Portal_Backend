import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health-check endpoint' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin dashboard greeting' })
  @ApiResponse({ status: 200, description: 'Admin greeting returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAdminDashboard() {
    return 'Welcome Admin!';
  }

  @Get('faculty/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Faculty')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Faculty dashboard greeting' })
  @ApiResponse({ status: 200, description: 'Faculty greeting returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getFacultyDashboard() {
    return 'Welcome Faculty!';
  }

  @Get('student/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Student')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Student dashboard greeting' })
  @ApiResponse({ status: 200, description: 'Student greeting returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStudentDashboard() {
    return 'Welcome Student!';
  }
}
