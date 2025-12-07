import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { validate as isUUID } from 'uuid';
import { uuid } from 'src/shared/types/uuid';
import { Artist } from 'src/artists/models/artist.interface';
import { Album } from 'src/albums/models/album.interface';
import { Track } from 'src/tracks/models/track.interface';

@Controller('favs')
export class FavoritesController {
  constructor(private readonly favs: FavoritesService) {}

  @Get()
  getAll(): {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
  } {
    return this.favs.getAll();
  }

  @Post('track/:id')
  addTrack(@Param('id') id: uuid): { message: string } {
    if (!isUUID(id)) {
      //TODO: replace in feature
      throw new BadRequestException('Invalid uuid');
    }
    this.favs.addTrack(id);
    return {
      //TODO: replace in feature
      message: 'Track added to favorites',
    };
  }

  @Delete('track/:id')
  @HttpCode(204)
  removeTrack(@Param('id') id: uuid): void {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }
    this.favs.removeTrack(id);
  }

  @Post('album/:id')
  addAlbum(@Param('id') id: uuid): { message: string } {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }

    this.favs.addAlbum(id);
    return {
      //TODO: replace in feature
      message: 'Album added to favorites',
    };
  }

  @Delete('album/:id')
  @HttpCode(204)
  removeAlbum(@Param('id') id: uuid): void {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }
    this.favs.removeAlbum(id);
  }

  @Post('artist/:id')
  addArtist(@Param('id') id: uuid): { message: string } {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }

    this.favs.addArtist(id);

    return {
      //TODO
      message: 'Artist added to favorites',
    };
  }

  @Delete('artist/:id')
  @HttpCode(204)
  removeArtist(@Param('id') id: uuid): void {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }

    this.favs.removeArtist(id);
  }
}
