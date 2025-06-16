import puppeteer, { Page, Browser } from "puppeteer";
import ora from "ora";
import { auto_scroll } from "@/server/scraper/helpers/auto_scroll";

export type RawFootage = {
  title: string;
  year: number;
  imdb: string;
  letterboxd: string | undefined;
};

let browser: Browser;
let page: Page | undefined;

export async function kubrick(username: string) {
  const url = `https://www.letterboxd.com/${username}/films`;
  await lights();
  await camera(url);
  const films = await action(url);
  console.log(`Kubricl length: ${films.length}`);
  return films;
}

export async function lights() {
  const _browser = ora("Launching browser").start();
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    _browser.succeed("Browser launched!");
  } catch (err) {
    _browser.fail("Failed to launch browser");
    console.error(err);
    return;
  }

  const _page = ora("🪩 LIGHTS 🪩").start();
  try {
    page = await browser.newPage();
    _page.succeed("Created a new page");
  } catch (err) {
    _page.fail("Failed to create a new page, using fallback tab!");
    console.error(err);
    const fallback = await browser.pages();
    if (fallback.length) {
      page = fallback[0];
    } else {
      _page.fail("However, there are no fallback tabs. Whoops?");
      return;
    }
  }
  if (!page) {
    ora().fail("🧨 Lights blew up.");
    await browser.close();
    return;
  }
}

export async function camera(url: string) {
  if (!page) {
    ora().fail("🧨 Camera blew up.");
    await browser.close();
    return;
  }

  const _letterboxd = ora(`📽️ CAMERA 📽️`).start();
  try {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["stylesheet", "font", "image"].includes(req.resourceType()))
        req.abort();
      else req.continue();
    });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    _letterboxd.succeed("Connected to LETTERBOXD 🔨");
  } catch (err) {
    _letterboxd.fail("Failed to connect to LETTERBOXD");
    console.error(err);
    await browser.close();
    return;
  }
}

export async function action(url: string): Promise<RawFootage[]> {
  if (!page) {
    ora().fail("🧨 Action blew up.");
    await browser.close();
    return [];
  }

  const films: RawFootage[] = [];
  let page_num = 1;

  const _action = ora(`🎬 ACTION! 🎬`).start();
  while (true) {
    const scene = `${url}/page/${page_num}`;
    let scenes: string[] = [];
    try {
      await page.goto(scene, { waitUntil: "domcontentloaded" });
      await auto_scroll(page);
      scenes = await page.$$eval(
        "li.poster-container div.film-poster a",
        (films) => films.map((film) => (film as HTMLAnchorElement).href),
      );

      if (scenes.length === 0) {
        _action.succeed(``);
        break;
      }

      for (let i = 0; i < scenes.length; i++) {
        const scene_location = scenes[i];
        if (!scene_location) continue;

        let take;
        try {
          take = await page.browser().newPage();
          await take.goto(scene_location, { waitUntil: "domcontentloaded" });
          const scene = await take.evaluate(() => {
            const title =
              document
                .querySelector("section.production-masthead span.name")
                ?.textContent?.trim() ?? "";
            const year = parseInt(
              document
                .querySelector("span.releasedate a")
                ?.textContent?.trim() ?? "0",
              10,
            );
            const imdb =
              (
                document.querySelector(
                  'p.text-footer a[data-track-action="IMDb"]',
                ) as HTMLAnchorElement
              )?.href ?? null;
            const letterboxd = window.location.pathname.split("/")[2];

            return { title, year, imdb, letterboxd };
          });
          films.push(scene);
          _action.text = `Filming scene ${i + 1} of ${scenes.length}`;
        } catch (error) {
          _action.fail(`🧨 Death by filming.`);
        } finally {
          if (take) await take.close();
        }

        await new Promise((r) => setTimeout(r, 300));
      }
      page_num++;
    } catch (error) {
      _action.fail(`🧨 We didn't make it on location :(`);
      break;
    }
  }
  return films;
}
