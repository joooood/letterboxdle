"use client";
import { type Film } from "@/server/db/schemata";
import { useEffect, useState } from "react";

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

    scrapeFilmography();
    fetchFilmography();
  }, []);

  return (
    <main id="homepage" style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Filmography</h1>
      {loading && <p>Loading films... 🎬</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        <ul>
          {filmography.map((film) => (
            <li key={film.id}>
              {film.title} ({film.year})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
