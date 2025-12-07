import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { uuid } from 'src/shared/types/uuid';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  year: number;

  @IsOptional()
  @IsString()
  artistId?: uuid | null;
}
