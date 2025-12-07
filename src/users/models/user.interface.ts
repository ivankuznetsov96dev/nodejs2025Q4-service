import { uuid } from 'src/shared/types/uuid';

export interface User {
  id: uuid;
  login: string;
  password: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}
