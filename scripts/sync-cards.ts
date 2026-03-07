/**
 * Sync cards.json to Supabase (upsert all cards) and optionally upload new card art.
 *
 * Usage:
 *   npx tsx scripts/sync-cards.ts            # sync card data + upload new images
 *   npx tsx scripts/sync-cards.ts --data-only # sync card data only, skip images
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

const CARDS_JSON = path.resolve(__dirname, "../src/data/cards.json");
const ART_DIR = path.resolve(__dirname, "../public/card-art");
const BUCKET = "card-art";
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local file");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const dataOnly = process.argv.includes("--data-only");

function normalizeCardNumber(num: string | null): string | null {
  if (!num) return null;
  return num.replace(/α/g, "a").toLowerCase();
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}

async function syncCardData(cards: Record<string, unknown>[]) {
  console.log(`\nSyncing ${cards.length} cards to Supabase...\n`);

  const { error } = await supabase.from("cards").upsert(cards, {
    onConflict: "id",
  });

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  console.log(`  OK: ${cards.length} card(s) upserted`);
}

async function uploadImages(cards: Record<string, unknown>[]) {
  if (!fs.existsSync(ART_DIR)) {
    console.log("\nNo public/card-art/ directory found, skipping image upload.");
    return;
  }

  const files = fs.readdirSync(ART_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  if (files.length === 0) {
    console.log("\nNo images in public/card-art/, skipping image upload.");
    return;
  }

  // List existing files in the bucket to skip already-uploaded ones
  const { data: existing } = await supabase.storage.from(BUCKET).list();
  const existingNames = new Set(existing?.map((f) => f.name) ?? []);

  // Build lookup: normalized card_number -> cards
  const cardsByNumber = new Map<string, typeof cards>();
  for (const card of cards) {
    const norm = normalizeCardNumber(card.card_number as string);
    if (!norm) continue;
    if (!cardsByNumber.has(norm)) cardsByNumber.set(norm, []);
    cardsByNumber.get(norm)!.push(card);
  }

  const newFiles = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    const baseName = normalizeCardNumber(path.basename(f, ext))!;
    // Check if any version of this file exists in storage
    return !IMAGE_EXTENSIONS.some((e) =>
      existingNames.has(`${baseName}${e}`)
    );
  });

  if (newFiles.length === 0) {
    console.log("\nAll images already uploaded, nothing new to upload.");
    return;
  }

  console.log(`\nUploading ${newFiles.length} new image(s)...\n`);

  let uploaded = 0;
  const urlMap = new Map<string, string>();

  for (const file of newFiles) {
    const ext = path.extname(file).toLowerCase();
    const rawName = path.basename(file, ext);
    const baseName = normalizeCardNumber(rawName)!;

    if (!cardsByNumber.has(baseName)) {
      console.warn(`  SKIP: "${file}" - no card with number "${baseName}"`);
      continue;
    }

    const fileBuffer = fs.readFileSync(path.join(ART_DIR, file));
    const storagePath = `${baseName}${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: getMimeType(ext),
        upsert: true,
      });

    if (error) {
      console.error(`  FAIL: ${file} - ${error.message}`);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    urlMap.set(baseName, publicUrl);
    uploaded++;
    console.log(`  OK: ${file} -> ${publicUrl}`);
  }

  if (urlMap.size === 0) return;

  // Update image_url in cards.json for newly uploaded images
  let updatedCount = 0;
  for (const card of cards) {
    const norm = normalizeCardNumber(card.card_number as string);
    if (norm && urlMap.has(norm)) {
      card.image_url = urlMap.get(norm)!;
      updatedCount++;
    }
  }

  // Propagate URLs to foil/variant cards sharing the same name
  for (const card of cards) {
    if (!card.image_url) {
      const match = cards.find(
        (c) => c.name === card.name && c.image_url
      );
      if (match) {
        card.image_url = match.image_url;
        updatedCount++;
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(CARDS_JSON, JSON.stringify(cards, null, 2) + "\n");
    console.log(`\nUpdated ${updatedCount} image URL(s) in cards.json`);
  }

  console.log(`\nUploaded ${uploaded} image(s)`);
}

async function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_JSON, "utf-8"));

  await syncCardData(cards);

  if (!dataOnly) {
    await uploadImages(cards);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
