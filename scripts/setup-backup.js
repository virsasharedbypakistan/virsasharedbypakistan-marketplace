require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupBackup() {
  console.log('\n' + '='.repeat(70));
  log('🔄 SETTING UP BACKUP DATABASE', 'cyan');
  console.log('='.repeat(70) + '\n');

  try {
    const primary = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const backup = createClient(
      process.env.SUPABASE_BACKUP_URL,
      process.env.SUPABASE_BACKUP_SERVICE_ROLE_KEY
    );

    // Read schema file
    log('📄 Reading schema file...', 'blue');
    const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
    
    // Split into individual statements (rough split by CREATE TABLE)
    const statements = schema.split(/(?=CREATE TABLE|ALTER TABLE|CREATE INDEX|CREATE POLICY|CREATE OR REPLACE FUNCTION|CREATE TRIGGER)/g)
      .filter(s => s.trim().length > 0);

    log(`  ✓ Found ${statements.length} SQL statements\n`, 'green');

    // Execute each statement
    log('🔨 Applying schema to backup database...', 'blue');
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      try {
        // Use Supabase's RPC to execute raw SQL
        const { error } = await backup.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Skip if already exists
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            skipCount++;
          } else {
            throw error;
          }
        } else {
          successCount++;
        }
        
        if ((i + 1) % 10 === 0) {
          log(`  Progress: ${i + 1}/${statements.length}`, 'yellow');
        }
      } catch (error) {
        log(`  ⚠ Skipped statement ${i + 1}: ${error.message.substring(0, 80)}...`, 'yellow');
        skipCount++;
      }
    }

    log(`\n  ✓ Applied: ${successCount} statements`, 'green');
    log(`  ⚠ Skipped: ${skipCount} statements`, 'yellow');

    // Now replicate data
    log('\n📊 Replicating data from primary to backup...', 'blue');
    
    const tables = [
      'users',
      'categories',
      'addresses',
      'vendors',
      'vendor_bank_details',
      'products',
      'cart_items',
      'wishlist_items',
      'orders',
      'order_items',
      'reviews',
      'notifications',
      'platform_settings',
      'deals',
      'commission_logs',
      'withdrawal_requests',
      'earnings_snapshots',
      'audit_logs'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await primary.from(table).select('*');
        
        if (error) {
          log(`  ⚠ ${table}: ${error.message}`, 'yellow');
          continue;
        }

        if (data && data.length > 0) {
          const { error: insertError } = await backup.from(table).upsert(data);
          
          if (insertError) {
            log(`  ⚠ ${table}: ${insertError.message}`, 'yellow');
          } else {
            log(`  ✓ ${table}: ${data.length} rows`, 'green');
          }
        } else {
          log(`  - ${table}: 0 rows`, 'reset');
        }
      } catch (error) {
        log(`  ⚠ ${table}: ${error.message}`, 'yellow');
      }
    }

    console.log('\n' + '='.repeat(70));
    log('✅ BACKUP DATABASE SETUP COMPLETE', 'green');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    log('❌ BACKUP SETUP FAILED', 'red');
    console.log('='.repeat(70));
    log(`\nError: ${error.message}`, 'red');
    process.exit(1);
  }
}

setupBackup();
