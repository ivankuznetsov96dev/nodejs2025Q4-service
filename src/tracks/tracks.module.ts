import { Module, forwardRef } from '@nestjs/common';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { FavoritesModule } from '../favorites/favorites.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackEntity } from 'src/tracks/entities/track.entity';

@Module({
  imports: [
    forwardRef(() => FavoritesModule),
    TypeOrmModule.forFeature([TrackEntity]),
  ],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
