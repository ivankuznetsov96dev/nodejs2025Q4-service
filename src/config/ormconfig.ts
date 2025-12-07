import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ArtistEntity } from '../artists/entities/artist.entity';
import { AlbumEntity } from '../albums/entities/album.entity';
import { TrackEntity } from '../tracks/entities/track.entity';
import { FavoritesEntity } from '../favorites/entities/favorites.entity';
import * as path from 'path';

export const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    UserEntity,
    ArtistEntity,
    AlbumEntity,
    TrackEntity,
    FavoritesEntity,
  ],
  migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
  migrationsRun: true,
};
