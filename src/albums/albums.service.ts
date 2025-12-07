import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Album } from './models/album.interface';
import { uuid } from 'src/shared/types/uuid';

@Injectable()
export class AlbumsService {
  private albums: Album[] = [];

  findAll(): Album[] {
    return this.albums.map((album: Album) => ({ ...album }));
  }

  findOne(id: uuid): Album | undefined {
    return this.albums.find((albom) => albom.id === id);
  }

  create(name: string, year: number, artistId: uuid | null): Album {
    const album: Album = {
      id: randomUUID(),
      name,
      year,
      artistId: artistId ?? null,
    };
    this.albums.push(album);
    return { ...album };
  }

  update(id: uuid, patch: Partial<Album>): Album {
    const album = this.findOne(id);
    if (!album) {
      //TODO
      throw new NotFoundException('Album not found');
    }

    Object.assign(album, patch);
    return { ...album };
  }

  remove(id: uuid): void {
    const idx = this.albums.findIndex((album: Album) => album.id === id);
    if (idx === -1) {
      throw new NotFoundException('Album not found');
    }

    this.albums.splice(idx, 1);
  }

  nullifyArtistReferences(artistId: uuid) {
    this.albums.forEach((album: Album) => {
      if (album.artistId === artistId) album.artistId = null;
    });
  }
}
