/** biome-ignore-all lint/style/useImportType: <explanation> */

import { CheckEmailDTO } from '@DTOs/check-email.dto';
import { LoginUserDto } from '@DTOs/login-user-dto';
import { RegisterUserDto } from '@DTOs/register-user.dto';
import { VerifyPinDTO } from '@DTOs/verify-pin.dto';
import { AuthProtection } from '@decorators/auth.decorator';
import { Public } from '@decorators/public.decorator';
import { RawToken } from '@decorators/raw-token.decorator';
import { RefreshTokenData } from '@decorators/refreshToken.decorator';
import { Metadata } from '@decorators/request-metadata.decorator';
import { CurrentUser } from '@decorators/user.decorator';
import { RequireEmailToken, VerifiedUser } from '@decorators/verify-email.decorator';
import { PasswordRecoverGuard } from '@guards/password-recover.guard';
import { PinGuard } from '@guards/pin.guard';
import { JwtRefreshGuard } from '@guards/refresh.guard';
import { EmailTokenGuard } from '@guards/verify-email.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Body, Controller, Get, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Request, Response } from 'express';
import { RecoverPasswordDto } from 'src/common/shared/dto/recover-password.dto';
import { ResetPasswordDto } from 'src/common/shared/dto/reset-password.dto';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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
    const user = await this.authService.loginUser(userData, {
      ip: metadata.ip,
      ua: metadata.userAgent,
    });
    res?.cookie('refresh_token', user.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
    return { message: 'User succesfully logged in', ...user };
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  async logout(@CurrentUser() user: any, @RawToken() token: string, @Res({ passthrough: true }) res: any) {
    await this.authService.fullLogout(user, token);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
  @Public()
  @Post('init-recover-account')
  async sendARecoverLink(@Body() recoverDto: RecoverPasswordDto) {
    const email = recoverDto.email;
    const token = await this.authService.initRecoverPassword(email);

    return { message: 'Send recover password link', token };
  }
  @Public()
  @UseGuards(PinGuard)
  @Post('verify-pin')
  async verifyPin(@Req() req: any, @Body() VerifyPinDTO: VerifyPinDTO, @Res({ passthrough: true }) res: any) {
    const resetToken = await this.authService.generateResetPasswordToken(req.userToReset?.email);
    res.cookie('reset_token', resetToken, {
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
  }
  @Public()
  @Post('reset-password')
  @UseGuards(PasswordRecoverGuard)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.resetPassword(resetPasswordDto.pass, req.resetPasswordToken);
    return { message: 'Password successfully updated' };
  }
  @Get('me')
  @UseInterceptors(CacheInterceptor)
  @AuthProtection(Role.STUDENT, Role.TEACHER)
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('access-token')
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @RefreshTokenData() refreshTokenData: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(refreshTokenData);
    res.cookie('refresh', tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      path: '/auth/refresh',
    });
    return { accessToken: tokens.accessToken };
  }
  @Public()
  @Get('check-email-availability')
  async checkEmail(@Query() query: CheckEmailDTO) {
    return this.authService.checkEmailAvailability(query.email);
  }
  @Post('verify-email')
  @Public()
  @RequireEmailToken()
  @UseGuards(EmailTokenGuard)
  @ApiQuery({ name: 'token', type: String, required: true }) // To magicznie doda pole w UI Swaggera
  async verifyEmail(
    @Metadata()
    meta: any,
    @VerifiedUser()
    user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.authenticateUser(user, {
      ip: meta.ip,
      ua: meta.userAgent,
    });
    return {
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
    };
  }
}
