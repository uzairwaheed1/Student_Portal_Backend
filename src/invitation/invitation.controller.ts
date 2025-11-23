import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@ApiTags('Invitation')
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation by setting password via token' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.invitationService.acceptInvitation(
      acceptInvitationDto.token,
      acceptInvitationDto.password,
    );
  }

  @Get('verify/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify if an invitation token is still valid' })
  @ApiResponse({ status: 200, description: 'Token validation result returned' })
  async verifyToken(@Param('token') token: string) {
    return this.invitationService.verifyToken(token);
  }
}

