import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "login" varchar(255) NOT NULL,
        "password" varchar(255) NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        "createdAt" bigint NOT NULL,
        "updatedAt" bigint NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "artists" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "grammy" boolean NOT NULL DEFAULT false
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "albums" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "year" integer NOT NULL,
        "artistId" uuid NULL,
        CONSTRAINT "fk_albums_artist"
          FOREIGN KEY ("artistId") REFERENCES "artists"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tracks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "artistId" uuid NULL,
        "albumId" uuid NULL,
        "duration" integer NOT NULL,
        CONSTRAINT "fk_tracks_artist"
          FOREIGN KEY ("artistId") REFERENCES "artists"("id")
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "fk_tracks_album"
          FOREIGN KEY ("albumId") REFERENCES "albums"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" integer PRIMARY KEY,
        "artists" text[] NOT NULL DEFAULT '{}'::text[],
        "albums" text[] NOT NULL DEFAULT '{}'::text[],
        "tracks" text[] NOT NULL DEFAULT '{}'::text[]
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "favorites";`);
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "tracks" DROP CONSTRAINT IF EXISTS "fk_tracks_album";`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "tracks" DROP CONSTRAINT IF EXISTS "fk_tracks_artist";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "tracks";`);
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "albums" DROP CONSTRAINT IF EXISTS "fk_albums_artist";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "albums";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "artists";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
  }
}
