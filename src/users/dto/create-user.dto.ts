import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;
}
