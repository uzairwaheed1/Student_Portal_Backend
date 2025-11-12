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
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  // Only allow in development mode
  @Post('all')
  @HttpCode(HttpStatus.OK)
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
  async checkSuperAdmin() {
    const exists = await this.seedService.checkSuperAdminExists();
    return {
      superAdminExists: exists,
    };
  }
}
