import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, map, switchMap, tap, throwError } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { uuid } from 'src/shared/types/uuid';

export type UserResponse = Omit<UserEntity, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  findAll(): Observable<UserResponse[]> {
    return from(this.userRepository.find()).pipe(
      map((users) =>
        users.map((user) => {
          const data = { ...user };
          delete data.password;
          return data;
        }),
      ),
    );
  }

  findOne(id: uuid): Observable<UserEntity | null> {
    return from(this.userRepository.findOne({ where: { id } }));
  }

  findByLogin(login: string): Observable<UserEntity | null> {
    return from(this.userRepository.findOne({ where: { login } }));
  }

  create(dto: CreateUserDto): Observable<UserResponse> {
    const now = Date.now();
    const user = this.userRepository.create({
      login: dto.login,
      password: dto.password,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    return from(this.userRepository.save(user)).pipe(
      map((savedUser) => {
        const data = { ...savedUser };
        delete data.password;
        return data;
      }),
    );
  }

  updatePassword(
    id: uuid,
    oldPassword: string,
    newPassword: string,
  ): Observable<UserResponse> {
    return this.findOne(id).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new NotFoundException('User not found'));
        }
        if (user.password !== oldPassword) {
          return throwError(() => null);
        }

        user.password = newPassword;
        user.version += 1;
        user.updatedAt = Date.now();

        return from(this.userRepository.save(user)).pipe(
          map((updatedUser) => {
            const data = { ...updatedUser };
            delete data.password;
            return data;
          }),
        );
      }),
    );
  }

  remove(id: uuid): Observable<void> {
    return from(this.userRepository.delete(id)).pipe(
      tap((result) => {
        if (result.affected === 0) {
          throw new NotFoundException('User not found');
        }
      }),
      map(() => undefined),
    );
  }
}
