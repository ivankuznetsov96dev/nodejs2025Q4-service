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
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumsService } from './albums.service';
import { TracksService } from '../tracks/tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { validate as isUUID } from 'uuid';
import { uuid } from 'src/shared/types/uuid';
import { AlbumEntity } from './entities/album.entity';

@Controller('album')
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
    private readonly favsService: FavoritesService,
  ) {}

  @Get()
  getAll(): Observable<AlbumEntity[]> {
    return this.albumsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: uuid): Observable<AlbumEntity> {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }

    return this.albumsService.findOne(id).pipe(
      switchMap((album) => {
        if (!album) {
          return throwError(() => new NotFoundException('Album not found'));
        }
        return of(album);
      }),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAlbumDto): Observable<AlbumEntity> {
    if (!dto || !dto.name || dto.year === undefined) {
      throw new BadRequestException('Missing fields');
    }

    return this.albumsService.create(dto.name, dto.year, dto.artistId ?? null);
  }

  @Put(':id')
  update(
    @Param('id') id: uuid,
    @Body() dto: UpdateAlbumDto,
  ): Observable<AlbumEntity> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.albumsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: uuid): Observable<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.albumsService.remove(id).pipe(
      tap(() => {
        this.tracksService.nullifyAlbumReferences(id).subscribe();
        this.favsService.removeAlbumFromAll(id).subscribe();
      }),
    );
  }
}
