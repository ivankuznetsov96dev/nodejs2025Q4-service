import { uuid } from 'src/shared/types/uuid';

export interface Artist {
  id: uuid;
  name: string;
  grammy: boolean;
}
