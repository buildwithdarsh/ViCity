/**
 * Image Optimization Script
 *
 * Converts all .jpg files in public/images/ to .webp format
 * with quality 80 and max 2000px width, preserving aspect ratio.
 *
 * Usage: npx tsx scripts/optimize-images.ts
 */

import sharp from "sharp";
import { readdir, unlink, stat } from "fs/promises";
import { join } from "path";

const IMAGES_DIR = join(process.cwd(), "public", "images");
const MAX_WIDTH = 2000;
const QUALITY = 80;

async function optimizeImages() {
  const files = await readdir(IMAGES_DIR);
  const jpgs = files.filter((f) => f.toLowerCase().endsWith(".jpg"));

  if (jpgs.length === 0) {
    console.log("No .jpg files found in public/images/");
    return;
  }

  console.log(`Found ${jpgs.length} .jpg files to convert\n`);

  let totalOriginal = 0;
  let totalConverted = 0;

  for (const file of jpgs) {
    const inputPath = join(IMAGES_DIR, file);
    const outputPath = join(IMAGES_DIR, file.replace(/\.jpg$/i, ".webp"));

    const originalStats = await stat(inputPath);
    totalOriginal += originalStats.size;

    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const newStats = await stat(outputPath);
    totalConverted += newStats.size;

    const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);
    console.log(
      `  ${file} → ${file.replace(/\.jpg$/i, ".webp")}  ` +
        `(${(originalStats.size / 1024 / 1024).toFixed(1)} MB → ${(newStats.size / 1024).toFixed(0)} KB, -${savings}%)`
    );
  }

  console.log(
    `\nTotal: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB → ${(totalConverted / 1024 / 1024).toFixed(1)} MB ` +
      `(-${((1 - totalConverted / totalOriginal) * 100).toFixed(1)}%)`
  );
  console.log(
    `\nConversion complete. After verifying, delete originals with:\n` +
      `  npx tsx scripts/optimize-images.ts --delete-originals`
  );

  // Optional: delete originals
  if (process.argv.includes("--delete-originals")) {
    console.log("\nDeleting original .jpg files...");
    for (const file of jpgs) {
      await unlink(join(IMAGES_DIR, file));
      console.log(`  Deleted ${file}`);
    }
    console.log("Done.");
  }
}

optimizeImages().catch(console.error);
