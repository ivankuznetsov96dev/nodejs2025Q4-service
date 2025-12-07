import { uuid } from 'src/shared/types/uuid';

export interface Track {
  id: uuid;
  name: string;
  artistId: uuid | null;
  albumId: uuid | null;
  duration: number;
}
