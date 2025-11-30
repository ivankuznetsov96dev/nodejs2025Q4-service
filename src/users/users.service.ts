import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './models/user.interface';
import { uuid } from 'src/shared/types/uuid';

@Injectable()
export class UsersService {
  //TODO: replace with DB in next task
  private users: User[] = [];

  findAll(): Omit<User, 'password'>[] {
    return this.users.map((user: User) => {
      const data = { ...user };
      delete data.password;
      return data;
    });
  }

  findOne(id: uuid): User | undefined {
    return this.users.find((user: User) => user.id === id);
  }

  create(dto: CreateUserDto): User {
    const now = Date.now();
    const user: User = {
      id: randomUUID(),
      login: dto.login,
      password: dto.password,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    return { ...user };
  }

  updatePassword(
    id: uuid,
    oldPassword: string,
    newPassword: string,
  ): Omit<User, 'password'> {
    const user = this.findOne(id);
    if (!user) {
      //TODO: replace with custom error class in next task
      throw new NotFoundException('User not found');
    }
    if (user.password !== oldPassword) {
      return undefined as any;
    }
    user.password = newPassword;
    user.version += 1;
    user.updatedAt = Date.now();

    const data = { ...user };
    delete data.password;
    return data;
  }

  remove(id: uuid): void {
    const idx = this.users.findIndex((data: User) => data.id === id);
    if (idx === -1) {
      //TODO: replace with custom error class in next task
      throw new NotFoundException('User not found');
    }
    this.users.splice(idx, 1);
  }
}
