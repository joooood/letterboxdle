export function generate_slug(title: string, imdb: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    `-${imdb.match(/tt\d+/)?.[0].replace("tt", "i")}`
  );
}
