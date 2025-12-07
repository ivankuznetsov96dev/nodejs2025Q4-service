import { IsInt, IsOptional, IsString } from 'class-validator';
import { uuid } from 'src/shared/types/uuid';

export class UpdateTrackDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  artistId?: uuid | null;

  @IsString()
  @IsOptional()
  albumId?: uuid | null;

  @IsInt()
  @IsOptional()
  duration?: number;
}
