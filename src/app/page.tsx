"use client";
import { useEffect, useState } from "react";
import { type Film } from "@/server/db/schemata";
import { FaImdb, FaSquareLetterboxd } from "react-icons/fa6";
import Link from "next/link";

export default function HomePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [filmography, setFilmography] = useState<Film[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function scrapeFilmography() {
      try {
        const res = await fetch("/api/films", { method: "POST" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${res.status} ${text}`);
        }
        const data = await res.json();
        console.log("Scrape result:", data);
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchFilmography() {
      try {
        const gretchen = await fetch("/api/films", { method: "GET" });
        if (!gretchen.ok) throw new Error("Stop trying to fetch happen!");

        const data = await gretchen.json();
        if (data.ok) {
          setFilmography(data.films);
        } else {
          setError("No films found");
        }
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    // scrapeFilmography();
    fetchFilmography();
  }, []);

  return (
    <main id="homepage" style={{ padding: 20, fontFamily: "system-ui" }}>
      {loading && <p>Loading films... 🎬</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        <ul className="flex flex-col gap-3">
          {filmography.map((film) => (
            <li className="flex gap-2 items-center" key={film.id}>
              <p>
                {film.title} ({film.year})
              </p>
              <Link
                href={film.imdb}
                target="_blank"
                className="aspect-square w-10"
              >
                <FaImdb className="size-full" />
              </Link>
              <Link
                href={`https://letterboxd.com/film/${film.letterboxd}`}
                target="_blank"
                className="aspect-square w-10"
              >
                <FaSquareLetterboxd className="size-full" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
