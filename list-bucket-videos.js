import { Client } from "@replit/object-storage";

const client = new Client();

console.log("🔍 Listing videos in Replit Object Storage...\n");

try {
  const { ok, value, error } = await client.list();
  
  if (!ok) {
    console.error("❌ Failed to list bucket contents:", error);
    process.exit(1);
  }
  
  console.log(`✅ Found ${value.length} files in bucket:\n`);
  
  // Show all files with their properties
  console.log("📁 All files in bucket:");
  value.forEach(file => {
    const fileName = typeof file === 'string' ? file : (file.key || file.name || JSON.stringify(file));
    console.log(`  - ${fileName}`);
  });
  
  // Filter for video files
  const videos = value.filter(file => {
    const name = typeof file === 'string' ? file : (file.key || file.name || '');
    return name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.webm');
  });
  
  console.log(`\n📹 Video files (${videos.length}):`);
  videos.forEach(video => {
    const name = typeof video === 'string' ? video : (video.key || video.name || JSON.stringify(video));
    console.log(`  - ${name}`);
  });
  
} catch (err) {
  console.error("❌ Error accessing bucket:", err);
  process.exit(1);
}
