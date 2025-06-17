import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { uniqueIndex } from "drizzle-orm/pg-core";
import { create_table } from "@/server/db/utils";
import { generate_slug, normalise_title } from "@/server/db/helpers";

export const films = create_table(
  "films",
  (film) => ({
    id: film.uuid().primaryKey().defaultRandom().notNull(),
    title: film.varchar({ length: 128 }).notNull(),
    title_normal: film.varchar({ length: 128 }),
    year: film.integer().notNull(),

    slug: film.varchar({ length: 128 }).unique().notNull(),

    imdb: film.varchar({ length: 64 }).unique().notNull(),
    letterboxd: film.varchar({ length: 128 }),

    quizzable: film.boolean().default(true).notNull(),
    createdAt: film.timestamp().defaultNow().notNull(),
    updatedAt: film.timestamp().defaultNow().notNull(),
  }),
  (films) => ({
    tityea: uniqueIndex("idx__films_tityea").on(films.title, films.year),
    slug: uniqueIndex("idx__slug").on(films.slug),
    imdb: uniqueIndex("idx__imdb").on(films.imdb),
    letterboxd: uniqueIndex("idx__letterboxd").on(films.letterboxd),
  }),
);

export type Film = InferSelectModel<typeof films>;
export type NewFilm = InferInsertModel<typeof films>;

export const create_film = (data: {
  title: string;
  year: number;
  imdb: string;
  letterboxd?: string;
}): NewFilm => {
  return {
    title: data.title,
    title_normal: normalise_title(data.title),
    year: data.year,
    slug: generate_slug(data.title, data.imdb),
    imdb: data.imdb,
    letterboxd: data.letterboxd ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
