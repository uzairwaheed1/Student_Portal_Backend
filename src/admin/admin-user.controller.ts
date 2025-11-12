import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
  } from '@nestjs/common';
  import { AdminUserService } from './admin-user.service';
  import { CreateAdminDto } from './dto/create-admin.dto';
  import { CreateFacultyDto } from './dto/create-faculty.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { CurrentUser } from '../auth/decorators/current-user.decorator';
  
  @Controller('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class AdminUserController {
    constructor(private readonly adminUserService: AdminUserService) {}
  
    // SuperAdmin creates Admin
    @Post('admins')
    @Roles('SuperAdmin')
    @HttpCode(HttpStatus.CREATED)
    async createAdmin(@Body() createAdminDto: CreateAdminDto, @CurrentUser() user: any) {
      return this.adminUserService.createAdmin(createAdminDto, user.id);
    }
  
    // Admin or SuperAdmin creates Faculty
    @Post('faculty')
    @Roles('Admin', 'SuperAdmin')
    @HttpCode(HttpStatus.CREATED)
    async createFaculty(@Body() createFacultyDto: CreateFacultyDto, @CurrentUser() user: any) {
      return this.adminUserService.createFaculty(createFacultyDto, user.id);
    }
  
    // Get all admins
    @Get('admins')
    @Roles('SuperAdmin')
    async getAllAdmins(
      @Query('page', ParseIntPipe) page: number = 1,
      @Query('limit', ParseIntPipe) limit: number = 10,
    ) {
      return this.adminUserService.getAllAdmins(page, limit);
    }
  
    // Get all faculty
    @Get('faculty')
    @Roles('Admin', 'SuperAdmin')
    async getAllFaculty(
      @Query('page', ParseIntPipe) page: number = 1,
      @Query('limit', ParseIntPipe) limit: number = 10,
    ) {
      return this.adminUserService.getAllFaculty(page, limit);
    }
  
    // Resend invitation
    @Post('users/:id/resend-invitation')
    @Roles('Admin', 'SuperAdmin')
    @HttpCode(HttpStatus.OK)
    async resendInvitation(@Param('id', ParseIntPipe) userId: number, @CurrentUser() user: any) {
      return this.adminUserService.resendInvitation(userId, user.id);
    }
  }
  