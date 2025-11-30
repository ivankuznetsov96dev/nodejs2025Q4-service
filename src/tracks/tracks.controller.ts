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
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TracksService } from './tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { validate as isUUID } from 'uuid';
import { uuid } from 'src/shared/types/uuid';
import { Track } from './models/track.interface';

@Controller('track')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly favsService: FavoritesService,
  ) {}

  @Get()
  getAll(): Track[] {
    return this.tracksService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: uuid): Track {
    if (!isUUID(id)) {
      //TODO
      throw new BadRequestException('Invalid uuid');
    }

    const track = this.tracksService.findOne(id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTrackDto): Track {
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
  update(@Param('id') id: uuid, @Body() dto: UpdateTrackDto): Track {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    return this.tracksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: uuid) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid uuid');
    }

    this.tracksService.remove(id);
    this.favsService.removeTrackFromAll(id);
  }
}
