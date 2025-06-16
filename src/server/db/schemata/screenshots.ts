import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";
import { create_table } from "@/server/db/utils";
import { films } from "@/server/db/schemata";

export const screenshots = create_table(
  "screenshots",
  (screenshot) => ({
    id: screenshot.uuid().primaryKey().defaultRandom().notNull(),
    film_id: screenshot
      .uuid()
      .notNull()
      .references(() => films.id),

    url: screenshot.varchar({ length: 512 }).notNull(),

    createdAt: screenshot.timestamp().defaultNow().notNull(),
    updatedAt: screenshot.timestamp().defaultNow().notNull(),
  }),
  (screenshots) => ({
    film_id: index("idx__screenshots__film_id").on(screenshots.film_id),
  }),
);

export type Screenshot = InferSelectModel<typeof screenshots>;
export type NewScreenshot = InferInsertModel<typeof screenshots>;

export const create_screenshot = (data: {
  film_id: string;
  url: string;
}): NewScreenshot => ({
  film_id: data.film_id,
  url: data.url,
  createdAt: new Date(),
  updatedAt: new Date(),
});
