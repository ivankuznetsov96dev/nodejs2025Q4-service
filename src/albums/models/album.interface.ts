import { uuid } from 'src/shared/types/uuid';

export interface Album {
  id: uuid;
  name: string;
  year: number;
  artistId: uuid | null;
}
