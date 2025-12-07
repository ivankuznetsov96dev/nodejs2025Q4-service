import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Track } from './models/track.interface';
import { uuid } from 'src/shared/types/uuid';

@Injectable()
export class TracksService {
  //TODO
  private tracks: Track[] = [];

  findAll(): Track[] {
    return this.tracks.map((track: Track) => ({ ...track }));
  }

  findOne(id: uuid): Track | undefined {
    return this.tracks.find((track: Track) => track.id === id);
  }

  create(
    name: string,
    duration: number,
    artistId: uuid | null,
    albumId: uuid | null,
  ): Track {
    const track: Track = {
      id: randomUUID(),
      name,
      duration,
      artistId: artistId ?? null,
      albumId: albumId ?? null,
    };

    this.tracks.push(track);
    return { ...track };
  }

  update(id: uuid, patch: Partial<Track>): Track {
    const track = this.findOne(id);

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    Object.assign(track, patch);
    return { ...track };
  }

  remove(id: uuid): void {
    const idx = this.tracks.findIndex((track: Track) => track.id === id);

    if (idx === -1) {
      throw new NotFoundException('Track not found');
    }

    this.tracks.splice(idx, 1);
  }

  nullifyArtistReferences(artistId: uuid): void {
    this.tracks.forEach((track: Track) => {
      if (track.artistId === artistId) {
        track.artistId = null;
      }
    });
  }

  nullifyAlbumReferences(albumId: uuid): void {
    this.tracks.forEach((track: Track) => {
      if (track.albumId === albumId) {
        track.albumId = null;
      }
    });
  }
}
