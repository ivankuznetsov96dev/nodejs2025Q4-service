import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, of, switchMap, throwError, from } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService, UserResponse } from './users.service';
import { validate as isUUID } from 'uuid';
import { uuid } from 'src/shared/types/uuid';
import * as bcrypt from 'bcrypt';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll(): Observable<UserResponse[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: uuid): Observable<UserResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.usersService.findOne(id).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new NotFoundException('User not found'));
        }
        const data = { ...user };
        delete data.password;
        return of(data);
      }),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto): Observable<UserResponse> {
    if (!dto || !dto.login || !dto.password) {
      throw new BadRequestException('Missing fields');
    }

    return this.usersService.create(dto);
  }

  @Put(':id')
  updatePassword(
    @Param('id') id: uuid,
    @Body() dto: UpdatePasswordDto,
  ): Observable<UserResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }
    if (!dto || !dto.oldPassword || !dto.newPassword) {
      throw new BadRequestException('Missing fields');
    }

    return this.usersService.findOne(id).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new NotFoundException('User not found'));
        }

        return from(bcrypt.compare(dto.oldPassword, user.password)).pipe(
          switchMap((isMatch) => {
            if (!isMatch) {
              return throwError(
                () => new ForbiddenException('Old password mismatch'),
              );
            }

            return this.usersService.updatePassword(
              id,
              dto.oldPassword,
              dto.newPassword,
            );
          }),
        );
      }),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: uuid): Observable<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.usersService.remove(id);
  }
}
