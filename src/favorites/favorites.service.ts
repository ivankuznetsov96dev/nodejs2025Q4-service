import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ArtistsService } from '../artists/artists.service';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';
import { uuid } from 'src/shared/types/uuid';
import { Album } from 'src/albums/models/album.interface';
import { Track } from 'src/tracks/models/track.interface';
import { Artist } from 'src/artists/models/artist.interface';

@Injectable()
export class FavoritesService {
  private artists: uuid[] = [];
  private albums: uuid[] = [];
  private tracks: uuid[] = [];

  constructor(
    private readonly artistsService: ArtistsService,
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
  ) {}

  getAll(): {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
  } {
    return {
      artists: this.artists
        .map((id) => this.artistsService.findOne(id))
        .filter(Boolean),
      albums: this.albums
        .map((id) => this.albumsService.findOne(id))
        .filter(Boolean),
      tracks: this.tracks
        .map((id) => this.tracksService.findOne(id))
        .filter(Boolean),
    };
  }

  addTrack(id: uuid): void {
    const track = this.tracksService.findOne(id);
    if (!track) {
      //TODO
      throw new UnprocessableEntityException('Track does not exist');
    }
    if (!this.tracks.includes(id)) {
      this.tracks.push(id);
    }
  }

  removeTrack(id: uuid): void {
    const idx = this.tracks.indexOf(id);
    if (idx === -1) {
      throw new NotFoundException('Track is not favorite');
    }
    this.tracks.splice(idx, 1);
  }

  addAlbum(id: uuid): void {
    const album = this.albumsService.findOne(id);
    if (!album) {
      throw new UnprocessableEntityException('Album does not exist');
    }
    if (!this.albums.includes(id)) this.albums.push(id);
  }

  removeAlbum(id: uuid): void {
    const idx = this.albums.indexOf(id);
    if (idx === -1) {
      throw new NotFoundException('Album is not favorite');
    }

    this.albums.splice(idx, 1);
  }

  addArtist(id: uuid): void {
    const artist = this.artistsService.findOne(id);
    if (!artist) {
      throw new UnprocessableEntityException('Artist does not exist');
    }

    if (!this.artists.includes(id)) {
      this.artists.push(id);
    }
  }

  removeArtist(id: uuid): void {
    const idx = this.artists.indexOf(id);
    if (idx === -1) {
      throw new NotFoundException('Artist is not favorite');
    }
    this.artists.splice(idx, 1);
  }

  removeArtistFromAll(artistId: uuid): void {
    this.artists = this.artists.filter((id) => id !== artistId);
  }

  removeAlbumFromAll(albumId: uuid) {
    this.albums = this.albums.filter((id) => id !== albumId);
  }

  removeTrackFromAll(trackId: uuid) {
    this.tracks = this.tracks.filter((id) => id !== trackId);
  }
}
