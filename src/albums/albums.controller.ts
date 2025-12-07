import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumsService } from './albums.service';
import { TracksService } from '../tracks/tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { validate as isUUID } from 'uuid';
import { uuid } from 'src/shared/types/uuid';
import { Album } from './models/album.interface';

@Controller('album')
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
    private readonly favsService: FavoritesService,
  ) {}

  @Get()
  getAll(): Album[] {
    return this.albumsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: uuid): Album {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }
    const album = this.albumsService.findOne(id);

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return album;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAlbumDto): Album {
    if (!dto || !dto.name || dto.year === undefined) {
      throw new BadRequestException('Missing fields');
    }

    return this.albumsService.create(dto.name, dto.year, dto.artistId ?? null);
  }

  @Put(':id')
  update(@Param('id') id: uuid, @Body() dto: UpdateAlbumDto): Album {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.albumsService.update(id, dto as UpdateAlbumDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: uuid): void {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    this.albumsService.remove(id);
    this.tracksService.nullifyAlbumReferences(id);

    this.favsService.removeAlbumFromAll(id);
  }
}
