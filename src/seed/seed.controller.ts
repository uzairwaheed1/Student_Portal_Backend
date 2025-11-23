// ============================================
// FILE: src/seed/seed.controller.ts (Optional - for manual triggering)
// ============================================
import { 
  Controller, 
  Post, 
  Get,
  HttpCode, 
  HttpStatus,
  UseGuards 
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Seed')
@Controller('seed')
@ApiBearerAuth('JWT-auth')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  // Only allow in development mode
  @Post('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @ApiOperation({ summary: 'Seed the database with baseline data (development only)' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  @ApiResponse({ status: 400, description: 'Attempted in production environment' })
  async seedAll() {
    if (process.env.NODE_ENV === 'production') {
      return {
        error: 'Seeding is disabled in production mode',
      };
    }

    await this.seedService.seedAll();
    return {
      message: 'Database seeded successfully',
    };
  }

  // Check if super admin exists (public endpoint for setup)
  @Get('check-super-admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check whether a Super Admin account already exists' })
  @ApiResponse({ status: 200, description: 'Returns boolean flag for super admin existence' })
  async checkSuperAdmin() {
    const exists = await this.seedService.checkSuperAdminExists();
    return {
      superAdminExists: exists,
    };
  }
}
