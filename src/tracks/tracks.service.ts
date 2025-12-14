import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, map, switchMap, tap, throwError } from 'rxjs';
import { TrackEntity } from './entities/track.entity';
import { uuid } from 'src/shared/types/uuid';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(TrackEntity)
    private readonly trackRepository: Repository<TrackEntity>,
  ) {}

  findAll(): Observable<TrackEntity[]> {
    return from(this.trackRepository.find());
  }

  findOne(id: uuid): Observable<TrackEntity | null> {
    return from(this.trackRepository.findOne({ where: { id } }));
  }

  create(
    name: string,
    duration: number,
    artistId: uuid | null,
    albumId: uuid | null,
  ): Observable<TrackEntity> {
    const track = this.trackRepository.create({
      name,
      duration,
      artistId: artistId ?? null,
      albumId: albumId ?? null,
    });

    return from(this.trackRepository.save(track));
  }

  update(id: uuid, patch: Partial<TrackEntity>): Observable<TrackEntity> {
    return this.findOne(id).pipe(
      switchMap((track) => {
        if (!track) {
          return throwError(() => new NotFoundException('Track not found'));
        }

        Object.assign(track, patch);
        return from(this.trackRepository.save(track));
      }),
    );
  }

  remove(id: uuid): Observable<void> {
    return from(this.trackRepository.delete(id)).pipe(
      tap((result) => {
        if (result.affected === 0) {
          throw new NotFoundException('Track not found');
        }
      }),
      map(() => undefined),
    );
  }

  nullifyArtistReferences(artistId: uuid): Observable<void> {
    return from(
      this.trackRepository.update({ artistId }, { artistId: null }),
    ).pipe(map(() => undefined));
  }

  nullifyAlbumReferences(albumId: uuid): Observable<void> {
    return from(
      this.trackRepository.update({ albumId }, { albumId: null }),
    ).pipe(map(() => undefined));
  }
}
