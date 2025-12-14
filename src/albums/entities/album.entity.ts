import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { uuid } from 'src/shared/types/uuid';

@Entity({ name: 'albums' })
export class AlbumEntity {
  @PrimaryGeneratedColumn('uuid')
  id: uuid;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'uuid', nullable: true })
  artistId: uuid | null;
}
