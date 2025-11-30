import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { uuid } from 'src/shared/types/uuid';
import { Artist } from './models/artist.interface';

@Injectable()
export class ArtistsService {
  private artists: Artist[] = [];

  findAll(): Artist[] {
    return this.artists.map((artist: Artist) => ({ ...artist }));
  }

  findOne(id: uuid): Artist | undefined {
    return this.artists.find((artist: Artist) => artist.id === id);
  }

  create(name: string, grammy: boolean): Artist {
    const artist: Artist = {
      id: randomUUID(),
      name,
      grammy,
    };

    this.artists.push(artist);
    return { ...artist };
  }

  update(id: uuid, patch: Partial<Artist>): Artist {
    const artist = this.findOne(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    Object.assign(artist, patch);
    return { ...artist };
  }

  remove(id: uuid): void {
    const idx = this.artists.findIndex((artist: Artist) => artist.id === id);

    if (idx === -1) {
      throw new NotFoundException('Artist not found');
    }

    this.artists.splice(idx, 1);
  }
}
