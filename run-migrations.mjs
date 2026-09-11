import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

// Supabase connection with password
const connectionString = 'postgresql://postgres:Namheo123%40%40@db.dmwydnlymleoayaqqxkb.supabase.co:5432/postgres';

async function runMigrations() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected\n');
    
    const migrationsDir = './supabase/migrations';
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files\n`);

    for (const file of files) {
      const filepath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filepath, 'utf8');
      
      try {
        console.log(`📋 Running ${file}...`);
        await client.query(sql);
        console.log(`✅ ${file} completed\n`);
      } catch (e) {
        console.error(`❌ Error in ${file}:`);
        console.error(e.message.substring(0, 200));
        console.log();
      }
    }
    
    console.log('✨ All migrations completed!');
    
  } catch (e) {
    console.error('❌ Connection failed:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
