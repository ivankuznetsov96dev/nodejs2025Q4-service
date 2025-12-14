import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService, UserResponse } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { TokenPair } from './models/token-pair.interface';
import { TokenPayload } from './models/token-payload.interface';

@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecret = this.configService.get<string>(
      'JWT_SECRET_KEY',
      'default_secret_key',
    );

    this.refreshTokenSecret = this.configService.get<string>(
      'JWT_SECRET_REFRESH_KEY',
      'default_refresh_secret_key',
    );


    this.accessTokenExpiry = this.configService.get<string>(
      'TOKEN_EXPIRE_TIME',
      '1h',
    );

    this.refreshTokenExpiry = this.configService.get<string>(
      'TOKEN_REFRESH_EXPIRE_TIME',
      '24h',
    );
  }

  signup(dto: SignupDto): Observable<UserResponse> {
    return from(this.hashPassword(dto.password)).pipe(
      switchMap((hashedPassword) => {
        return this.usersService.create({
          login: dto.login,
          password: hashedPassword,
        });
      }),
    );
  }

  login(dto: LoginDto): Observable<TokenPair> {
    return this.usersService.findByLogin(dto.login).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () => new ForbiddenException('Invalid login or password'),
          );
        }

        return from(bcrypt.compare(dto.password, user.password)).pipe(
          switchMap((isPasswordValid) => {
            if (!isPasswordValid) {
              return throwError(
                () => new ForbiddenException('Invalid login or password'),
              );
            }

            const payload: TokenPayload = {
              userId: user.id,
              login: user.login,
            };

            return from(this.generateTokenPair(payload));
          }),
        );
      }),
    );
  }

  refresh(refreshToken: string): Observable<TokenPair> {
    return from(this.verifyRefreshToken(refreshToken)).pipe(
      switchMap((payload) => {
        const newPayload: TokenPayload = {
          userId: payload.userId,
          login: payload.login,
        };

        return from(this.generateTokenPair(newPayload));
      }),
    );
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiry,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.refreshTokenSecret,
      });

      return payload;
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }

  async validateAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.accessTokenSecret,
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
