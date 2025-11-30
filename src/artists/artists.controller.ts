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
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistsService } from './artists.service';
import { validate as isUUID } from 'uuid';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { uuid } from 'src/shared/types/uuid';

@Controller('artist')
export class ArtistsController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
    private readonly favsService: FavoritesService,
  ) {}

  @Get()
  getAll() {
    return this.artistsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: uuid) {
    if (!isUUID(id)) throw new BadRequestException('Invalid uuid');
    const artist = this.artistsService.findOne(id);
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateArtistDto) {
    if (!dto || !dto.name || dto.grammy === undefined) {
      throw new BadRequestException('Missing fields');
    }

    return this.artistsService.create(dto.name, dto.grammy);
  }

  @Put(':id')
  update(@Param('id') id: uuid, @Body() dto: UpdateArtistDto) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.artistsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: uuid) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }
    this.artistsService.remove(id);

    this.albumsService.nullifyArtistReferences(id);
    this.tracksService.nullifyArtistReferences(id);
    this.favsService.removeArtistFromAll(id);
  }
}
