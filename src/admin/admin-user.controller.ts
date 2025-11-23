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
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminUserService } from './admin-user.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@ApiTags('Admin Management')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}
  
    // SuperAdmin creates Admin
  @Post('admins')
  @Roles('SuperAdmin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Admin user (SuperAdmin only)' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Admin already exists for email' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @CurrentUser() user: any) {
    return this.adminUserService.createAdmin(createAdminDto, user.id);
  }
  
    // Admin or SuperAdmin creates Faculty
  @Post('faculty')
  @Roles('Admin', 'SuperAdmin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a Faculty user' })
  @ApiResponse({ status: 201, description: 'Faculty user invited successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Faculty already exists for email' })
  async createFaculty(@Body() createFacultyDto: CreateFacultyDto, @CurrentUser() user: any) {
    return this.adminUserService.createFaculty(createFacultyDto, user.id);
  }
  
    // Get all admins
  @Get('admins')
  @Roles('SuperAdmin')
  @ApiOperation({ summary: 'Get paginated list of Admin users' })
  @ApiResponse({ status: 200, description: 'List of admin users returned' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllAdmins(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.adminUserService.getAllAdmins(page, limit);
  }
  
    // Get all faculty
  @Get('faculty')
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Get paginated list of Faculty users' })
  @ApiResponse({ status: 200, description: 'List of faculty users returned' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllFaculty(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.adminUserService.getAllFaculty(page, limit);
  }

  // In admin-user.controller.ts:

@Patch('admins/:id')
@Roles('SuperAdmin')
@ApiOperation({ summary: 'Update admin details' })
@ApiResponse({ status: 200, description: 'Admin updated successfully' })
async updateAdmin(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateAdminDto,
  @CurrentUser() user: any,
) {
  return this.adminUserService.updateAdmin(id, dto, user.id);
}

@Delete('admins/:id')
@Roles('SuperAdmin')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Delete admin (cannot delete super admin)' })
@ApiResponse({ status: 200, description: 'Admin deleted successfully' })
async deleteAdmin(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: any,
) {
  return this.adminUserService.deleteAdmin(id, user.id);
}

@Patch('faculty/:id')
@Roles('Admin', 'SuperAdmin')
@ApiOperation({ summary: 'Update faculty details' })
@ApiResponse({ status: 200, description: 'Faculty updated successfully' })
async updateFaculty(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateFacultyDto,
  @CurrentUser() user: any,
) {
  return this.adminUserService.updateFaculty(id, dto, user.id);
}

@Delete('faculty/:id')
@Roles('SuperAdmin')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Delete faculty (only if no courses assigned)' })
@ApiResponse({ status: 200, description: 'Faculty deleted successfully' })
async deleteFaculty(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: any,
) {
  return this.adminUserService.deleteFaculty(id, user.id);
}
  
    // Resend invitation
  @Post('users/:id/resend-invitation')
  @Roles('Admin', 'SuperAdmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend invitation email to an existing user' })
  @ApiResponse({ status: 200, description: 'Invitation email resent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendInvitation(@Param('id', ParseIntPipe) userId: number, @CurrentUser() user: any) {
    return this.adminUserService.resendInvitation(userId, user.id);
  }
}
  