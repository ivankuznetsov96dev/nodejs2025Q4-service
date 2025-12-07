import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { uuid } from 'src/shared/types/uuid';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  name: uuid;

  @IsOptional()
  @IsString()
  artistId?: uuid | null;

  @IsOptional()
  @IsString()
  albumId?: uuid | null;

  @IsInt()
  duration: number;
}
