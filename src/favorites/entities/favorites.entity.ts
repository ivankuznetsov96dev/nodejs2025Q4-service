import { Entity, PrimaryColumn, Column } from 'typeorm';
import { uuid } from 'src/shared/types/uuid';

@Entity({ name: 'favorites' })
export class FavoritesEntity {
  @PrimaryColumn({ type: 'integer' })
  id: uuid;

  @Column('text', { array: true, default: [] })
  artists: uuid[];

  @Column('text', { array: true, default: [] })
  albums: uuid[];

  @Column('text', { array: true, default: [] })
  tracks: uuid[];
}
