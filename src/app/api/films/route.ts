import { kubrick } from "@/server/scraper";
import { db } from "@/server/db";
import { create_film, films } from "@/server/db/schemata";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const all = await db.select().from(films);
    return NextResponse.json({ ok: true, films: all });
  } catch (error) {
    console.error("Failed to fetch films:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const filmography = await kubrick("justinemck");

    const criterion_collection = filmography
      .filter((film) => film.title && film.year && film.imdb)
      .map((film) => create_film(film));

    const uniqueFilms = Array.from(
      new Map(criterion_collection.map((film) => [film.slug, film])).values(),
    );

    await db
      .insert(films)
      .values(uniqueFilms)
      .onConflictDoUpdate({
        target: [films.imdb],
        set: {
          title: sql`excluded.title`,
          title_normal: sql`excluded.title_normal`,
          year: sql`excluded.year`,
          slug: sql`excluded.slug`,
          letterboxd: sql`excluded.letterboxd`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      });

    return NextResponse.json({
      ok: true,
      count: criterion_collection.length,
    });
  } catch (error) {
    console.error("💥 Scraper or DB failed:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
