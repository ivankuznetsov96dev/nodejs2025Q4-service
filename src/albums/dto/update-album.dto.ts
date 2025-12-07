import { IsInt, IsOptional, IsString } from 'class-validator';
import { uuid } from 'src/shared/types/uuid';

export class UpdateAlbumDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  artistId?: uuid | null;
}
