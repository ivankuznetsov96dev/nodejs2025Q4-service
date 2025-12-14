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
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TracksService } from './tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { validate as isUUID } from 'uuid';
import { uuid } from 'src/shared/types/uuid';
import { TrackEntity } from './entities/track.entity';

@Controller('track')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly favsService: FavoritesService,
  ) {}

  @Get()
  getAll(): Observable<TrackEntity[]> {
    return this.tracksService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: uuid): Observable<TrackEntity> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.tracksService.findOne(id).pipe(
      switchMap((track) => {
        if (!track) {
          return throwError(() => new NotFoundException('Track not found'));
        }

        return of(track);
      }),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTrackDto): Observable<TrackEntity> {
    if (!dto || !dto.name || dto.duration === undefined) {
      throw new BadRequestException('Missing fields');
    }

    return this.tracksService.create(
      dto.name,
      dto.duration,
      dto.artistId ?? null,
      dto.albumId ?? null,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: uuid,
    @Body() dto: UpdateTrackDto,
  ): Observable<TrackEntity> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.tracksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: uuid): Observable<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.tracksService.remove(id).pipe(
      tap(() => {
        this.favsService.removeTrackFromAll(id).subscribe();
      }),
    );
  }
}
