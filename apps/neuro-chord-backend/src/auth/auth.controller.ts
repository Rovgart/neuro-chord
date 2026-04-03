/** biome-ignore-all lint/style/useImportType: <explanation> */

import { CheckEmailDTO } from '@DTOs/check-email.dto';
import { LoginUserDto } from '@DTOs/login-user-dto';
import { RegisterUserDto } from '@DTOs/register-user.dto';
import { AuthProtection } from '@decorators/auth.decorator';
import { Public } from '@decorators/public.decorator';
import { RawToken } from '@decorators/raw-token.decorator';
import { RecoverPasswordToken } from '@decorators/recover-password.decorator';
import { Metadata } from '@decorators/request-metadata.decorator';
import { CurrentUser } from '@decorators/user.decorator';
import { RequireEmailToken } from '@decorators/verify-email.decorator';
import { PasswordRecoverGuard } from '@guards/password-recover.guard';
import { JwtRefreshGuard } from '@guards/refresh.guard';
import { EmailTokenGuard } from '@guards/verify-email.guard';
import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SecurityService } from '@security/security.service';
import type { Request, Response } from 'express';
import { RecoverPasswordDto } from 'src/common/shared/dto/recover-password.dto';
import { ResetPasswordDto } from 'src/common/shared/dto/reset-password.dto';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private securityService: SecurityService,
  ) {}
  @Post('register')
  @Public()
  async register(@Body() userData: RegisterUserDto, @Res({ passthrough: true }) res: Response) {
    return await this.authService.registerUser(userData);
  }
  @Public()
  @Post('login')
  async login(
    @Metadata() metadata: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() userData: LoginUserDto,
  ) {
    const user = await this.authService.loginUser(userData, { ip: metadata.ip, ua: metadata.userAgent });
    res?.cookie('refresh_token', user.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
    return { message: 'User succesfully logged in', ...user };
  }
  @Post('logout')
  async logout(@CurrentUser() user: any, @RawToken() token: string, @Res({ passthrough: true }) res: any) {
    await this.authService.fullLogout(user, token);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
  @Post('init-recover-account')
  async sendARecoverLink(@Body() recoverDto: RecoverPasswordDto) {
    const email = recoverDto.email;
    const token = await this.authService.initRecoverPassword(email);

    return { message: 'Send recover password link', token };
  }
  @Post('reset-password')
  @UseGuards(PasswordRecoverGuard)
  async resetPassword(
    @RecoverPasswordToken() @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.resetPassword(token, resetPasswordDto.newPassword);
    return { message: 'Password successfully updated' };
  }
  @Get('me')
  @AuthProtection(Role.STUDENT, Role.TEACHER)
  async getMe(@CurrentUser() user: any) {
    return user;
  }
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const tokens = await this.securityService.refreshTokens(refreshToken);
    res.cookie('refresh', tokens?.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV !== 'production' ? 'none' : 'strict',
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }
  @Post('check-email-availability')
  async checkEmail(@Query('email') query: CheckEmailDTO) {
    return this.authService.checkEmailAvailability(query.email);
  }
  @RequireEmailToken()
  @Post('verify-email')
  @UseGuards(EmailTokenGuard)
  async verifyEmail(
    @Query('token')
    authData: any,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const tokens = await this.authService.authenticateUser(authData.token, authData.devInfo);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }
}
