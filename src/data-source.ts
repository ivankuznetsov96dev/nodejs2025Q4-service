import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ormConfig } from './config/ormconfig';

export default new DataSource(ormConfig);
