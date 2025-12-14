import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { uuid } from 'src/shared/types/uuid';

@Entity({ name: 'tracks' })
export class TrackEntity {
  @PrimaryGeneratedColumn('uuid')
  id: uuid;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  artistId: uuid | null;

  @Column({ type: 'uuid', nullable: true })
  albumId: uuid | null;

  @Column({ type: 'integer' })
  duration: number;
}
