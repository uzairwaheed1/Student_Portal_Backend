import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.invitationService.acceptInvitation(
      acceptInvitationDto.token,
      acceptInvitationDto.password,
    );
  }

  @Get('verify/:token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Param('token') token: string) {
    return this.invitationService.verifyToken(token);
  }
}

