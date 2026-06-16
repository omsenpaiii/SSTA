import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const assetDir = path.join(rootDir, "public", "baker-course-assets");
const outputPath = path.join(rootDir, "scripts", "baker-course-data.json");

const cdxUrl =
  "https://web.archive.org/cdx?url=bakerebert.edu.au/course/*&output=json&fl=timestamp,original,statuscode,mimetype,digest,length&filter=statuscode:200&filter=mimetype:text/html";

function decodeEntities(value = "") {
  return value
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function stripTags(value = "") {
  return decodeEntities(
    value
      .replace(/<span[^>]*class="accessibilityOnly"[^>]*>[\s\S]*?<\/span>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractFirst(html, pattern) {
  const match = html.match(pattern);
  return match ? decodeEntities(match[1].trim()) : "";
}

function extractSection(html, id) {
  const startMatch = html.match(new RegExp(`<div class="tabContentContainer" id="${id}"[^>]*>`, "i"));
  if (!startMatch || startMatch.index === undefined) return "";

  const start = startMatch.index + startMatch[0].length;
  const next = html.slice(start).search(/<div class="tabContentContainer" id="courseTab\d+"/i);
  const section = next >= 0 ? html.slice(start, start + next) : html.slice(start);
  const match = section.match(/<div class="tabContent">([\s\S]*?)(?:<\/div>\s*){2,}/i);
  return match ? match[1].trim() : "";
}

function extractUnits(html) {
  const table = extractFirst(
    html,
    /<table[^>]*(?:summary|title)="Table listing Units of Competency"[^>]*>([\s\S]*?)<\/table>/i,
  );

  if (!table) return [];

  return [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map(([, row]) => [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(([, cell]) => stripTags(cell)))
    .filter((cells) => cells.length >= 3 && cells[0] && cells[1])
    .map(([code, title, type]) => ({
      code,
      title,
      type: /core/i.test(type) ? "Core" : /elective/i.test(type) ? "Elective" : "Skill set",
    }));
}

function slugFromOriginal(original) {
  return original.replace(/\/$/, "").split("/").pop();
}

function assetNameFromUrl(url, fallbackSlug) {
  const clean = url.replace(/^https:\/\/web\.archive\.org\/web\/\d+im_\//, "");
  const extension = path.extname(new URL(clean).pathname) || ".jpg";
  return `${fallbackSlug}${extension}`.replace(/[^a-z0-9_.-]/gi, "-").toLowerCase();
}

function canonicalAssetUrl(url) {
  return url.replace(/^https:\/\/web\.archive\.org\/web\/\d+im_\//, "");
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function downloadAsset(url, filename) {
  let response = await fetch(url);

  if (response.ok && !response.headers.get("content-type")?.startsWith("image/")) {
    const canonical = canonicalAssetUrl(url);
    const cdx = await fetchText(
      `https://web.archive.org/cdx?url=${encodeURIComponent(canonical)}&output=json&fl=timestamp,original,statuscode,mimetype,length&filter=statuscode:200`,
    );
    const rows = JSON.parse(cdx).slice(1);
    const imageRow = rows
      .filter((row) => String(row[3]).startsWith("image/"))
      .sort((a, b) => Number(b[4] ?? 0) - Number(a[4] ?? 0))[0];

    if (imageRow) {
      response = await fetch(`https://web.archive.org/web/${imageRow[0]}im_/${imageRow[1]}`);
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  if (!response.headers.get("content-type")?.startsWith("image/")) {
    throw new Error(`Downloaded asset was not an image: ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(assetDir, filename), buffer);
}

async function main() {
  await mkdir(assetDir, { recursive: true });

  const cdx = await fetchText(cdxUrl);
  const rows = JSON.parse(cdx).slice(1);
  const bestRows = new Map();

  for (const row of rows) {
    const [, original, , , , length = "0"] = row;
    if (!/\/course\//.test(original)) continue;
    const slug = slugFromOriginal(original);
    const previous = bestRows.get(slug);
    if (!previous || Number(length) > Number(previous[5] ?? 0)) {
      bestRows.set(slug, row);
    }
  }

  const courses = [];

  for (const [timestamp, original] of bestRows.values()) {
    const archiveUrl = `https://web.archive.org/web/${timestamp}/${original}`;
    const html = await fetchText(archiveUrl);
    const bakerSlug = slugFromOriginal(original);
    const title = stripTags(extractFirst(html, /<h1 class="bannerTitle">([\s\S]*?)<\/h1>/i));
    const code = title.match(/\(([A-Z0-9]+)\)/)?.[1] ?? "";
    const imageUrl = extractFirst(html, /<section class="section heroBanner"[\s\S]*?<img[^>]+src="([^"]+)"/i);
    const videoUrl = extractFirst(html, /<div class="videoItem">[\s\S]*?<video[^>]+src="([^"]+)"/i);
    const overviewHtml = extractFirst(html, /<p class="courseShortDesc">([\s\S]*?)<\/p>\s*<\/div>/i);
    const durationHtml = extractSection(html, "courseTab2");
    const feesHtml = extractSection(html, "courseTab3");
    const entryHtml = extractSection(html, "courseTab4");
    const deliveryStrategy = stripTags(
      extractFirst(html, /<section class="section deliveryStrategySec"[\s\S]*?<div class="sidePadTextContainer">([\s\S]*?)<\/div>/i),
    );
    const units = extractUnits(html);

    let localImage = "";
    if (imageUrl) {
      const filename = assetNameFromUrl(imageUrl, bakerSlug);
      await downloadAsset(imageUrl, filename);
      localImage = `/baker-course-assets/${filename}`;
    }

    courses.push({
      bakerSlug,
      archiveUrl,
      original,
      title,
      code,
      image: localImage,
      sourceImageUrl: imageUrl,
      videoUrl,
      overview: stripTags(overviewHtml),
      durationDetails: stripTags(durationHtml),
      feeDetails: stripTags(feesHtml),
      entryRequirements: stripTags(entryHtml)
        .split(/(?<=\.)\s+(?=[A-Z])/)
        .map((item) => item.trim())
        .filter(Boolean),
      deliveryStrategy,
      units,
    });

    console.log(`Imported ${title || bakerSlug}`);
  }

  await writeFile(outputPath, `${JSON.stringify(courses, null, 2)}\n`);
  console.log(`Wrote ${courses.length} courses to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
