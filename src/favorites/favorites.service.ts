import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Observable,
  from,
  map,
  switchMap,
  throwError,
  of,
  forkJoin,
} from 'rxjs';
import { FavoritesEntity } from './entities/favorites.entity';
import { ArtistEntity } from '../artists/entities/artist.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { uuid } from 'src/shared/types/uuid';

const FAVORITES_ID = 1;

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritesEntity)
    private readonly favoritesRepository: Repository<FavoritesEntity>,
    @InjectRepository(ArtistEntity)
    private readonly artistRepository: Repository<ArtistEntity>,
    @InjectRepository(AlbumEntity)
    private readonly albumRepository: Repository<AlbumEntity>,
    @InjectRepository(TrackEntity)
    private readonly trackRepository: Repository<TrackEntity>,
  ) {}

  getAll(): Observable<{
    artists: ArtistEntity[];
    albums: AlbumEntity[];
    tracks: TrackEntity[];
  }> {
    return this.getFavorites().pipe(
      switchMap((favorites) => {
        const artists$ =
          favorites.artists.length > 0
            ? from(
                this.artistRepository
                  .createQueryBuilder('artist')
                  .where('artist.id IN (:...ids)', { ids: favorites.artists })
                  .getMany(),
              )
            : of([]);

        const albums$ =
          favorites.albums.length > 0
            ? from(
                this.albumRepository
                  .createQueryBuilder('album')
                  .where('album.id IN (:...ids)', { ids: favorites.albums })
                  .getMany(),
              )
            : of([]);

        const tracks$ =
          favorites.tracks.length > 0
            ? from(
                this.trackRepository
                  .createQueryBuilder('track')
                  .where('track.id IN (:...ids)', { ids: favorites.tracks })
                  .getMany(),
              )
            : of([]);

        return forkJoin({
          artists: artists$,
          albums: albums$,
          tracks: tracks$,
        });
      }),
    );
  }

  addTrack(id: uuid): Observable<void> {
    return from(this.trackRepository.findOne({ where: { id } })).pipe(
      switchMap((track) => {
        if (!track) {
          return throwError(
            () => new UnprocessableEntityException('Track does not exist'),
          );
        }
        return this.getFavorites().pipe(
          switchMap((favorites) => {
            if (!favorites.tracks.includes(id)) {
              favorites.tracks.push(id);
              return from(this.favoritesRepository.save(favorites)).pipe(
                map(() => undefined),
              );
            }
            return of(undefined);
          }),
        );
      }),
    );
  }

  removeTrack(id: uuid): Observable<void> {
    return this.getFavorites().pipe(
      switchMap((favorites) => {
        const idx = favorites.tracks.indexOf(id);
        if (idx === -1) {
          return throwError(
            () => new NotFoundException('Track is not favorite'),
          );
        }
        favorites.tracks.splice(idx, 1);
        return from(this.favoritesRepository.save(favorites)).pipe(
          map(() => undefined),
        );
      }),
    );
  }

  addAlbum(id: uuid): Observable<void> {
    return from(this.albumRepository.findOne({ where: { id } })).pipe(
      switchMap((album) => {
        if (!album) {
          return throwError(
            () => new UnprocessableEntityException('Album does not exist'),
          );
        }

        return this.getFavorites().pipe(
          switchMap((favorites) => {
            if (!favorites.albums.includes(id)) {
              favorites.albums.push(id);
              return from(this.favoritesRepository.save(favorites)).pipe(
                map(() => undefined),
              );
            }

            return of(undefined);
          }),
        );
      }),
    );
  }

  removeAlbum(id: uuid): Observable<void> {
    return this.getFavorites().pipe(
      switchMap((favorites) => {
        const idx = favorites.albums.indexOf(id);
        if (idx === -1) {
          return throwError(
            () => new NotFoundException('Album is not favorite'),
          );
        }

        favorites.albums.splice(idx, 1);
        return from(this.favoritesRepository.save(favorites)).pipe(
          map(() => undefined),
        );
      }),
    );
  }

  addArtist(id: uuid): Observable<void> {
    return from(this.artistRepository.findOne({ where: { id } })).pipe(
      switchMap((artist) => {
        if (!artist) {
          return throwError(
            () => new UnprocessableEntityException('Artist does not exist'),
          );
        }

        return this.getFavorites().pipe(
          switchMap((favorites) => {
            if (!favorites.artists.includes(id)) {
              favorites.artists.push(id);
              return from(this.favoritesRepository.save(favorites)).pipe(
                map(() => undefined),
              );
            }

            return of(undefined);
          }),
        );
      }),
    );
  }

  removeArtist(id: uuid): Observable<void> {
    return this.getFavorites().pipe(
      switchMap((favorites) => {
        const idx = favorites.artists.indexOf(id);
        if (idx === -1) {
          return throwError(
            () => new NotFoundException('Artist is not favorite'),
          );
        }

        favorites.artists.splice(idx, 1);
        return from(this.favoritesRepository.save(favorites)).pipe(
          map(() => undefined),
        );
      }),
    );
  }

  removeArtistFromAll(artistId: uuid): Observable<void> {
    return this.getFavorites().pipe(
      switchMap((favorites) => {
        favorites.artists = favorites.artists.filter((id) => id !== artistId);
        return from(this.favoritesRepository.save(favorites)).pipe(
          map(() => undefined),
        );
      }),
    );
  }

  removeAlbumFromAll(albumId: uuid): Observable<void> {
    return this.getFavorites().pipe(
      switchMap((favorites) => {
        favorites.albums = favorites.albums.filter((id) => id !== albumId);
        return from(this.favoritesRepository.save(favorites)).pipe(
          map(() => undefined),
        );
      }),
    );
  }

  removeTrackFromAll(trackId: uuid): Observable<void> {
    return this.getFavorites().pipe(
      switchMap((favorites) => {
        favorites.tracks = favorites.tracks.filter((id) => id !== trackId);
        return from(this.favoritesRepository.save(favorites)).pipe(
          map(() => undefined),
        );
      }),
    );
  }

  private getFavorites(): Observable<FavoritesEntity> {
    return from(
      this.favoritesRepository.findOne({
        where: { id: FAVORITES_ID.toString() },
      }),
    ).pipe(
      switchMap((favorites) => {
        if (!favorites) {
          const newFavorites = this.favoritesRepository.create({
            id: FAVORITES_ID.toString(),
            artists: [],
            albums: [],
            tracks: [],
          });
          return from(this.favoritesRepository.save(newFavorites));
        }

        return of(favorites);
      }),
    );
  }
}
