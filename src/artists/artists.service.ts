import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, map, switchMap, tap, throwError } from 'rxjs';
import { ArtistEntity } from './entities/artist.entity';
import { uuid } from 'src/shared/types/uuid';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(ArtistEntity)
    private readonly artistRepository: Repository<ArtistEntity>,
  ) {}

  findAll(): Observable<ArtistEntity[]> {
    return from(this.artistRepository.find());
  }

  findOne(id: uuid): Observable<ArtistEntity | null> {
    return from(this.artistRepository.findOne({ where: { id } }));
  }

  create(name: string, grammy: boolean): Observable<ArtistEntity> {
    const artist = this.artistRepository.create({ name, grammy });
    return from(this.artistRepository.save(artist));
  }

  update(id: uuid, patch: Partial<ArtistEntity>): Observable<ArtistEntity> {
    return this.findOne(id).pipe(
      switchMap((artist) => {
        if (!artist) {
          return throwError(() => new NotFoundException('Artist not found'));
        }

        Object.assign(artist, patch);
        return from(this.artistRepository.save(artist));
      }),
    );
  }

  remove(id: uuid): Observable<void> {
    return from(this.artistRepository.delete(id)).pipe(
      tap((result) => {
        if (result.affected === 0) {
          throw new NotFoundException('Artist not found');
        }
      }),
      map(() => undefined),
    );
  }
}
