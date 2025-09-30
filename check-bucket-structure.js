import { Client } from "@replit/object-storage";

const client = new Client();

console.log("🔍 Checking bucket structure...\n");

try {
  // Try listing with different prefixes
  const prefixes = ['', 'videos/', 'assets/', 'objects/'];
  
  for (const prefix of prefixes) {
    console.log(`\n📁 Listing with prefix: "${prefix || '(root)'}"`);
    const { ok, value, error } = await client.list({ prefix });
    
    if (ok && value.length > 0) {
      console.log(`  Found ${value.length} files:`);
      value.forEach(file => {
        const name = typeof file === 'string' ? file : (file.key || file.name || JSON.stringify(file));
        console.log(`    - ${name}`);
      });
    } else if (!ok) {
      console.log(`  Error: ${error}`);
    } else {
      console.log(`  (empty)`);
    }
  }
  
} catch (err) {
  console.error("❌ Error:", err);
}
