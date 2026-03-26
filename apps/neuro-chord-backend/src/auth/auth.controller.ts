/** biome-ignore-all lint/style/useImportType: <explanation> */
import { Body, Controller, Get, HttpStatus, NotFoundException, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CreateProfileDto } from 'src/auth/dto/create-profile-dto';
import { LoginUserDto } from 'src/auth/dto/login-user-dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { UsersService } from 'src/users/users.service';
import { CheckEmailDTO } from './dto/check-email.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from './guards/auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UsersService) {}

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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Post('complete-profile')
  async completeProfile(@Req() req: any, @Body() dto: CreateProfileDto) {
    const userIdFromToken = req.user.sub || req.user.id;
    return await this.userService.createProfile(userIdFromToken, dto);
  }
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
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
  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies?.refresh_token;
    if (token) {
      await this.userService.fullLogout(token, refreshToken);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
  @ApiBearerAuth('access-token')
  @Post('recover')
  async sendARecoverLink(@Body() recoverDto: RecoverPasswordDto) {
    const email = recoverDto.email;
    const link = await this.userService.recoverPassword(email);

    return { message: 'Send recover password link', link };
  }
  @ApiBearerAuth('access-token')
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    await this.userService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return { message: 'Password successfully updated' };
  }
  @Get('me')
  async getMe(@Req() request: Request, @Res({ passthrough: true }) res: Response) {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new NotFoundException('Refresh token doesnt exists');
    }
    const tokens = await this.userService.refreshTokens(refreshToken);
    res.cookie('refresh_token', tokens, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
    });
    return tokens;
  }
  @Post()
  async checkEmail(@Query() query: CheckEmailDTO) {
    return this.userService.isEmailAvailable(query.email);
  }
}
