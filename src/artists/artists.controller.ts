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
import { Observable, switchMap, throwError, tap, of } from 'rxjs';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ArtistsService } from './artists.service';
import { validate as isUUID } from 'uuid';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { uuid } from 'src/shared/types/uuid';
import { ArtistEntity } from './entities/artist.entity';

@Controller('artist')
export class ArtistsController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
    private readonly favsService: FavoritesService,
  ) {}

  @Get()
  getAll(): Observable<ArtistEntity[]> {
    return this.artistsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: uuid): Observable<ArtistEntity> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.artistsService.findOne(id).pipe(
      switchMap((artist) => {
        if (!artist) {
          return throwError(() => new NotFoundException('Artist not found'));
        }

        return of(artist);
      }),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateArtistDto): Observable<ArtistEntity> {
    if (!dto || !dto.name || dto.grammy === undefined) {
      throw new BadRequestException('Missing fields');
    }

    return this.artistsService.create(dto.name, dto.grammy);
  }

  @Put(':id')
  update(
    @Param('id') id: uuid,
    @Body() dto: UpdateArtistDto,
  ): Observable<ArtistEntity> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.artistsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: uuid): Observable<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.artistsService.remove(id).pipe(
      tap(() => {
        this.albumsService.nullifyArtistReferences(id).subscribe();
        this.tracksService.nullifyArtistReferences(id).subscribe();
        this.favsService.removeArtistFromAll(id).subscribe();
      }),
    );
  }
}
