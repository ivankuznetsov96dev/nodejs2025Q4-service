import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { FavoritesService } from './favorites.service';
import { validate as isUUID } from 'uuid';
import { uuid } from 'src/shared/types/uuid';
import { ArtistEntity } from '../artists/entities/artist.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { TrackEntity } from '../tracks/entities/track.entity';

@Controller('favs')
export class FavoritesController {
  constructor(private readonly favs: FavoritesService) {}

  @Get()
  getAll(): Observable<{
    artists: ArtistEntity[];
    albums: AlbumEntity[];
    tracks: TrackEntity[];
  }> {
    return this.favs.getAll();
  }

  @Post('track/:id')
  addTrack(@Param('id') id: uuid): Observable<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.favs
      .addTrack(id)
      .pipe(map(() => ({ message: 'Track added to favorites' })));
    //TODO
  }

  @Delete('track/:id')
  @HttpCode(204)
  removeTrack(@Param('id') id: uuid): Observable<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.favs.removeTrack(id);
  }

  @Post('album/:id')
  addAlbum(@Param('id') id: uuid): Observable<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.favs
      .addAlbum(id)
      .pipe(map(() => ({ message: 'Album added to favorites' })));
  }

  @Delete('album/:id')
  @HttpCode(204)
  removeAlbum(@Param('id') id: uuid): Observable<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.favs.removeAlbum(id);
  }

  @Post('artist/:id')
  addArtist(@Param('id') id: uuid): Observable<{ message: string }> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.favs
      .addArtist(id)
      .pipe(map(() => ({ message: 'Artist added to favorites' })));
  }

  @Delete('artist/:id')
  @HttpCode(204)
  removeArtist(@Param('id') id: uuid): Observable<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.favs.removeArtist(id);
  }
}
