import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('google')
  async googleLogin(@Body() body: { idToken: string }) {
    return this.authService.googleLogin(body.idToken);
  }

  @Get('me')
  async me(@Headers('authorization') authorization: string) {
    const token = authorization.replace('Bearer ', '');
    return this.authService.getUserFromToken(token);
  }

  @Post('logout')
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string }) {
    return this.authService.resetPassword(body.email);
  }
} 