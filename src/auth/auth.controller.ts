import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(200)
  adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, 'Admin');
  }

  @Post('faculty/login')
  @HttpCode(200)
  facultyLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, 'Faculty');
  }

  @Post('student/login')
  @HttpCode(200)
  studentLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, 'Student');
  }
}
