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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';
import { validate as isUUID } from 'uuid';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    if (!isUUID(id)) {
      //TODO: replace with custom error class in next task
      throw new BadRequestException('Invalid uuid');
    }

    const user = this.usersService.findOne(id);

    if (!user) {
      //TODO
      throw new NotFoundException('User not found');
    }
    const data = { ...user };
    delete data.password;
    return data;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) {
    if (!dto || !dto.login || !dto.password) {
      //TODO
      throw new BadRequestException('Missing fields');
    }

    const user = this.usersService.create(dto);

    const data = { ...user };
    delete data.password;
    return data;
  }

  @Put(':id')
  updatePassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    if (!isUUID(id)) {
      //TODO!
      throw new BadRequestException('Invalid uuid');
    }
    if (!dto || !dto.oldPassword || !dto.newPassword) {
      throw new BadRequestException('Missing fields');
    }

    const user = this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.password !== dto.oldPassword) {
      throw new ForbiddenException('Old password mismatch');
    }

    const updated = this.usersService.updatePassword(
      id,
      dto.oldPassword,
      dto.newPassword,
    );

    return updated;
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }

    this.usersService.remove(id);
  }
}
