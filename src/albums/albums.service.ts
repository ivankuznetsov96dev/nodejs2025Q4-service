import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, map, switchMap, tap, throwError } from 'rxjs';
import { AlbumEntity } from './entities/album.entity';
import { uuid } from 'src/shared/types/uuid';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(AlbumEntity)
    private readonly albumRepository: Repository<AlbumEntity>,
  ) {}

  findAll(): Observable<AlbumEntity[]> {
    return from(this.albumRepository.find());
  }

  findOne(id: uuid): Observable<AlbumEntity | null> {
    return from(this.albumRepository.findOne({ where: { id } }));
  }

  create(
    name: string,
    year: number,
    artistId: uuid | null,
  ): Observable<AlbumEntity> {
    const album = this.albumRepository.create({
      name,
      year,
      artistId: artistId ?? null,
    });

    return from(this.albumRepository.save(album));
  }

  update(id: uuid, patch: Partial<AlbumEntity>): Observable<AlbumEntity> {
    return this.findOne(id).pipe(
      switchMap((album) => {
        if (!album) {
          return throwError(() => new NotFoundException('Album not found'));
        }

        Object.assign(album, patch);
        return from(this.albumRepository.save(album));
      }),
    );
  }

  remove(id: uuid): Observable<void> {
    return from(this.albumRepository.delete(id)).pipe(
      tap((result) => {
        if (result.affected === 0) {
          throw new NotFoundException('Album not found');
        }
      }),
      map(() => undefined),
    );
  }

  nullifyArtistReferences(artistId: uuid): Observable<void> {
    return from(
      this.albumRepository.update({ artistId }, { artistId: null }),
    ).pipe(map(() => undefined));
  }
}
