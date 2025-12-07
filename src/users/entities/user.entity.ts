import { uuid } from 'src/shared/types/uuid';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: uuid;

  @Column({ type: 'varchar', length: 255 })
  login: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  updatedAt: number;
}
