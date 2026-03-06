/**
 * Upload card art from public/card-art/ to Supabase Storage
 * and update cards.json with the resulting public URLs.
 *
 * Usage:
 *   1. Save images to public/card-art/ named by card number (e.g., 116.png, a026.png, N001.png)
 *   2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *   3. Run: npx tsx scripts/upload-card-art.ts
 *
 * Naming: Use the card number without special chars. Alpha "α026" -> "a026.png", Spoiler "116" -> "116.png"
 * Supports .png, .jpg, .jpeg, .webp formats.
 * Foil printings and same-name variants share art automatically.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

const BUCKET = "card-art";
const ART_DIR = path.resolve(__dirname, "../public/card-art");
const CARDS_JSON = path.resolve(__dirname, "../src/data/cards.json");
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

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    });
    if (error) {
      console.error("Failed to create bucket:", error.message);
      process.exit(1);
    }
    console.log(`Created public bucket: ${BUCKET}`);
  } else {
    console.log(`Bucket "${BUCKET}" already exists`);
  }
}

async function main() {
  await ensureBucket();

  // Find all image files in the art directory
  if (!fs.existsSync(ART_DIR)) {
    console.error(`Art directory not found: ${ART_DIR}`);
    console.error("Create it and add your card images first.");
    process.exit(1);
  }

  const files = fs.readdirSync(ART_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  if (files.length === 0) {
    console.log("No image files found in public/card-art/");
    console.log("Add images named by card number (e.g., 116.png, a026.png)");
    return;
  }

  console.log(`Found ${files.length} image(s) to upload\n`);

  // Load cards.json
  const cards = JSON.parse(fs.readFileSync(CARDS_JSON, "utf-8"));

  // Normalize card_number for matching: "α026" -> "a026", "116" -> "116", "N001" -> "n001"
  function normalizeCardNumber(num: string | null): string | null {
    if (!num) return null;
    return num.replace(/α/g, "a").toLowerCase();
  }

  // Build lookup: normalized card_number -> list of cards
  const cardsByNumber = new Map<string, typeof cards>();
  for (const card of cards) {
    const norm = normalizeCardNumber(card.card_number);
    if (!norm) continue;
    if (!cardsByNumber.has(norm)) cardsByNumber.set(norm, []);
    cardsByNumber.get(norm)!.push(card);
  }

  // Upload each file and collect URL mappings (keyed by normalized card number)
  const urlMap = new Map<string, string>();

  for (const file of files) {
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
    console.log(`  OK: ${file} -> ${publicUrl}`);
  }

  if (urlMap.size === 0) {
    console.log("\nNo files were uploaded. Nothing to update.");
    return;
  }

  // Update cards.json - match by card_number, then propagate to same-name variants
  let updated = 0;
  for (const card of cards) {
    const norm = normalizeCardNumber(card.card_number);
    if (norm && urlMap.has(norm)) {
      card.image_url = urlMap.get(norm)!;
      updated++;
      continue;
    }

    // Check if a card with the same name already has art (foil/alternate printings)
    if (!card.image_url) {
      const match = cards.find(
        (c: { name: string; image_url: string | null }) =>
          c.name === card.name && c.image_url
      );
      if (match) {
        card.image_url = match.image_url;
        updated++;
      }
    }
  }

  fs.writeFileSync(CARDS_JSON, JSON.stringify(cards, null, 2) + "\n");
  console.log(`\nUpdated ${updated} card(s) in cards.json`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
