import { Client } from "@replit/object-storage";
import fs from 'fs/promises';
import path from 'path';

const client = new Client();
const targetDir = './public/assets';

console.log("📥 Downloading videos from Object Storage to public/assets...\n");

const videoFiles = [
  'bouncing.mp4',
  'digging.mp4',
  'jumping.mp4',
  'layback.mp4',
  'paws.mp4',
  'tail-chase.mp4',
  'tired.mp4',
  'waving.mp4'
];

let downloaded = 0;
let failed = 0;

for (const videoName of videoFiles) {
  try {
    console.log(`⬇️  Downloading ${videoName}...`);
    
    // Download from Object Storage
    const { ok, value, error } = await client.downloadAsBytes(videoName);
    
    if (!ok) {
      console.error(`❌ Failed to download ${videoName}:`, error);
      failed++;
      continue;
    }
    
    // Write to public/assets
    const targetPath = path.join(targetDir, videoName);
    await fs.writeFile(targetPath, Buffer.from(value));
    
    console.log(`✅ Downloaded ${videoName} (${value.length} bytes)`);
    downloaded++;
    
  } catch (err) {
    console.error(`❌ Error downloading ${videoName}:`, err.message);
    failed++;
  }
}

console.log(`\n📊 Summary: ${downloaded} downloaded, ${failed} failed`);
