import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import type { CreateProfileDto } from 'src/users/dto/create-profile-dto';
import type { LoginUserDto } from 'src/users/dto/login-user-dto';
import type { RegisterUserDto } from 'src/users/dto/register-user.dto';
import type { UsersService } from 'src/users/users.service';
import { AuthGuard } from './guards/auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UsersService) {}

  @Post('register')
  async register(@Body() userData: RegisterUserDto) {
    return this.userService.registerUser(userData);
  }

  @Post('login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() userData: LoginUserDto,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      'unknown';
    const { accessToken, refreshToken } = await this.userService.loginUser(
      userData,
      userAgent,
      ipAddress,
    );
    req.res.cookie('refresh_token', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
    return res.json({
      accessToken,
      user: req.user,
    });
  }
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Post('complete-profile')
  async completeProfile(@Request() req: any, @Body() dto: CreateProfileDto) {
    const userIdFromToken = req.user.sub || req.user.id;
    return await this.userService.createProfile(userIdFromToken, dto);
  }
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Get('get-profile')
  async getProfile(@Request() req: any) {
    const userIdFromToken = req.user.id;
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
  async logout(@Req() req: any, @Res() res: any) {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies['refresh_token'];
    await this.userService.fullLogout(token, refreshToken);
    res.clearCookie('access_token');
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Logged out successfully' });
  }
}
