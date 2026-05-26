// One-time migration: downloads every image from Supabase Storage,
// compresses it with sharp, and re-uploads in place.
//
// Run: node scripts/compress-existing-photos.js
// Skips files already under SKIP_BELOW_KB to avoid re-compressing small images.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SKIP_BELOW_KB = 100; // files already small enough — skip

const BUCKETS = {
  'listing-media': {
    // avatar files get a small box; everything else gets listing size
    resolve: (name) =>
      name.includes('avatar') ? { width: 400, height: 400 } : { width: 1920, height: 1920 },
    quality: 82,
  },
  'chat-media': {
    resolve: () => ({ width: 1280, height: 1280 }),
    quality: 82,
  },
};

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

async function listAll(bucket) {
  const files = [];
  const walk = async (prefix) => {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
    if (error) throw error;
    for (const item of data ?? []) {
      if (item.metadata) {
        // it's a file
        files.push(prefix ? `${prefix}/${item.name}` : item.name);
      } else {
        // it's a folder — recurse
        await walk(prefix ? `${prefix}/${item.name}` : item.name);
      }
    }
  };
  await walk('');
  return files;
}

async function processFile(bucket, path, cfg) {
  // Download
  const { data: blob, error: dlErr } = await supabase.storage.from(bucket).download(path);
  if (dlErr) { console.error(`  download error: ${dlErr.message}`); return false; }

  const bytes = await blob.arrayBuffer();
  const buf = Buffer.from(bytes);

  // Skip already-small files
  if (buf.byteLength < SKIP_BELOW_KB * 1024) {
    console.log(`  skip (${Math.round(buf.byteLength / 1024)} KB already small)`);
    return false;
  }

  const { width, height } = cfg.resolve(path);

  let compressed;
  try {
    compressed = await sharp(buf)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: cfg.quality, mozjpeg: true })
      .toBuffer();
  } catch (e) {
    console.error(`  compress error: ${e.message}`);
    return false;
  }

  const saved = Math.round((1 - compressed.byteLength / buf.byteLength) * 100);
  console.log(`  ${Math.round(buf.byteLength / 1024)} KB → ${Math.round(compressed.byteLength / 1024)} KB (−${saved}%)`);

  // Re-upload in place as JPEG
  const jpegPath = path.replace(/\.\w+$/, '.jpg');
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(jpegPath, compressed, { contentType: 'image/jpeg', upsert: true });
  if (upErr) { console.error(`  upload error: ${upErr.message}`); return false; }

  // Remove old file if extension changed (e.g. .png → .jpg)
  if (jpegPath !== path) {
    await supabase.storage.from(bucket).remove([path]);
  }

  return true;
}

async function main() {
  let total = 0, compressed = 0, skipped = 0, failed = 0;

  for (const [bucket, cfg] of Object.entries(BUCKETS)) {
    console.log(`\n=== ${bucket} ===`);
    let files;
    try { files = await listAll(bucket); } catch (e) {
      console.error(`Could not list ${bucket}: ${e.message}`);
      continue;
    }
    console.log(`Found ${files.length} file(s)`);

    for (const path of files) {
      total++;
      console.log(`[${total}] ${path}`);
      const ok = await processFile(bucket, path, cfg);
      if (ok) compressed++;
      else skipped++;
    }
  }

  console.log(`\nDone — ${compressed} compressed, ${skipped} skipped, ${failed} failed (of ${total} total)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
