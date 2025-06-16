import { pgTableCreator } from "drizzle-orm/pg-core";
export const create_table = pgTableCreator((name) => `letterboxdle_${name}`);
