import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserResponse } from '../users/users.service';
import { Public } from './decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { TokenPair } from './models/token-pair.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto): Observable<UserResponse> {
    if (
      !dto ||
      typeof dto.login !== 'string' ||
      typeof dto.password !== 'string'
    ) {
      throw new BadRequestException('Login and password must be strings');
    }

    if (!dto.login || !dto.password) {
      throw new BadRequestException('Login and password are required');
    }


    return this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Observable<TokenPair> {
    if (
      !dto ||
      typeof dto.login !== 'string' ||
      typeof dto.password !== 'string'
    ) {
      throw new BadRequestException('Login and password must be strings');
    }

    if (!dto.login || !dto.password) {
      throw new BadRequestException('Login and password are required');
    }

    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto): Observable<TokenPair> {
    if (!dto || !dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    if (typeof dto.refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token must be a string');
    }

    return this.authService.refresh(dto.refreshToken);
  }
}
