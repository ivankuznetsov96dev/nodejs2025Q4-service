import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { uuid } from 'src/shared/types/uuid';

@Entity({ name: 'artists' })
export class ArtistEntity {
  @PrimaryGeneratedColumn('uuid')
  id: uuid;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: false })
  grammy: boolean;
}
