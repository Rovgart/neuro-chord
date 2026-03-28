/** biome-ignore-all lint/style/useImportType: <explanation> */
import { Body, Controller, Get, HttpStatus, NotFoundException, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateProfileDto } from 'src/auth/dto/create-profile-dto';
import { LoginUserDto } from 'src/auth/dto/login-user-dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthProtection } from './decorators/auth.decorator';
import { Public } from './decorators/public.decorator';
import { RecoverPasswordToken } from './decorators/recover-password.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { CheckEmailDTO } from './dto/check-email.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { PasswordRecoverGuard } from './guards/password-recover.guard';
import { JwtRefreshGuard } from './guards/refresh.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UsersService) {}
  @Public()
  @Post('register')
  async register(@Body() userData: RegisterUserDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const registeredUser = await this.userService.registerUser(userData, { ip, ua });
    res?.cookie('refresh_token', registeredUser.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return registeredUser;
  }
  @Public()
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() userData: LoginUserDto) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      (req.socket ? req.socket.remoteAddress : null) ||
      'unknown';
    const user = await this.userService.loginUser(userData, { ip: ipAddress as string, ua: userAgent });
    res?.cookie('refresh_token', user.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
    return { message: 'User succesfully logged in', ...user };
  }
  @AuthProtection()
  @Post('complete-profile')
  async completeProfile(@CurrentUser() user: any, @Body() dto: CreateProfileDto) {
    return await this.userService.createProfile(user.id, dto);
  }
  @AuthProtection()
  @Get('get-profile')
  async getProfile(@Req() req: Request) {
    const userIdFromToken = req.user as string;
    if (!userIdFromToken) {
      throw new NotFoundException("User doesn't exist");
    }
    return await this.userService.getProfile(userIdFromToken);
  }
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async auth() {}
  @UseGuards(GoogleOAuthGuard)
  @Get('google/callback')
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    const token = await this.userService.validateOAuthUser(req.user);
    res.cookie('access_token', token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });
    return res.status(HttpStatus.OK);
  }
  @AuthProtection()
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await this.userService.fullLogout(token);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
  @Post('init-recover-account')
  async sendARecoverLink(@Body() recoverDto: RecoverPasswordDto) {
    const email = recoverDto.email;
    const token = await this.userService.initRecoverPassword(email);

    return { message: 'Send recover password link', token };
  }
  @Post('reset-password')
  @UseGuards(PasswordRecoverGuard)
  async resetPassword(
    @RecoverPasswordToken() @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.userService.resetPassword(token, resetPasswordDto.newPassword);
    return { message: 'Password successfully updated' };
  }
  @AuthProtection()
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return user;
  }
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const tokens = await this.userService.refreshTokens(refreshToken);
    res.cookie('refresh', tokens?.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV !== 'production' ? 'none' : 'strict',
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }
  @AuthProtection()
  @Post('')
  async checkEmail(@Query('email') query: CheckEmailDTO) {
    return this.userService.isEmailAvailable(query.email);
  }
}
