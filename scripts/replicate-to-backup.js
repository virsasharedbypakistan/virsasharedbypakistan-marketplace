require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

async function replicateToBackup() {
  console.log('\n' + '='.repeat(70));
  log('🔄 REPLICATING DATA TO BACKUP DATABASE', 'cyan');
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

    const tables = [
      'categories',
      'platform_settings',
      'users',
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
      'deals',
      'commission_logs',
      'withdrawal_requests',
      'earnings_snapshots',
      'audit_logs'
    ];

    let totalReplicated = 0;

    for (const table of tables) {
      try {
        const { data, error } = await primary.from(table).select('*');
        
        if (error) {
          log(`  ⚠ ${table}: ${error.message}`, 'yellow');
          continue;
        }

        if (data && data.length > 0) {
          // Special handling for platform_settings (different schema)
          if (table === 'platform_settings') {
            const cleanData = data.map(row => ({
              key: row.key,
              value: row.value,
              description: row.description,
              updated_by: row.updated_by,
              updated_at: row.updated_at
            }));
            
            const { error: insertError } = await backup.from(table).upsert(cleanData, {
              onConflict: 'key'
            });
            
            if (insertError) {
              log(`  ⚠ ${table}: ${insertError.message}`, 'yellow');
            } else {
              log(`  ✓ ${table}: ${data.length} rows`, 'green');
              totalReplicated += data.length;
            }
          } else {
            const { error: insertError } = await backup.from(table).upsert(data, {
              onConflict: 'id'
            });
            
            if (insertError) {
              log(`  ⚠ ${table}: ${insertError.message}`, 'yellow');
            } else {
              log(`  ✓ ${table}: ${data.length} rows`, 'green');
              totalReplicated += data.length;
            }
          }
        } else {
          log(`  - ${table}: 0 rows (empty)`, 'reset');
        }
      } catch (error) {
        log(`  ⚠ ${table}: ${error.message}`, 'yellow');
      }
    }

    console.log('\n' + '='.repeat(70));
    log(`✅ REPLICATION COMPLETE: ${totalReplicated} total rows`, 'green');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    log('❌ REPLICATION FAILED', 'red');
    console.log('='.repeat(70));
    log(`\nError: ${error.message}`, 'red');
    process.exit(1);
  }
}

replicateToBackup();
