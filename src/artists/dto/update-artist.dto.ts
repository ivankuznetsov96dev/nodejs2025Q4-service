import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  grammy?: boolean;
}
