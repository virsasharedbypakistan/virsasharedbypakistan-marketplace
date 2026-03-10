require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Colors for console output
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

async function testConnections() {
  console.log('\n' + '='.repeat(70));
  log('🔍 VIRSA DATABASE CONNECTION TEST', 'cyan');
  console.log('='.repeat(70) + '\n');

  let allPassed = true;
  let primary, backup;

  // ═══════════════════════════════════════════════════════════
  // 1. TEST SUPABASE PRIMARY
  // ═══════════════════════════════════════════════════════════
  log('📡 Testing Supabase Primary (Mumbai)...', 'blue');
  try {
    primary = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test connection
    const { data: tables, error } = await primary
      .from('categories')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    log('  ✓ Connection successful', 'green');
    log(`  ✓ URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, 'green');
    
    // Check tables
    const { data: categories } = await primary.from('categories').select('id');
    const { data: users } = await primary.from('users').select('id');
    const { data: products } = await primary.from('products').select('id');
    
    log(`  ✓ Categories: ${categories?.length || 0}`, 'green');
    log(`  ✓ Users: ${users?.length || 0}`, 'green');
    log(`  ✓ Products: ${products?.length || 0}`, 'green');
  } catch (error) {
    log('  ✗ Connection failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    allPassed = false;
  }

  // ═══════════════════════════════════════════════════════════
  // 2. TEST SUPABASE BACKUP
  // ═══════════════════════════════════════════════════════════
  log('\n📡 Testing Supabase Backup (Singapore)...', 'blue');
  try {
    backup = createClient(
      process.env.SUPABASE_BACKUP_URL,
      process.env.SUPABASE_BACKUP_SERVICE_ROLE_KEY
    );

    const { data: tables, error } = await backup
      .from('categories')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    log('  ✓ Connection successful', 'green');
    log(`  ✓ URL: ${process.env.SUPABASE_BACKUP_URL}`, 'green');
    
    const { data: categories } = await backup.from('categories').select('id');
    const { data: users } = await backup.from('users').select('id');
    const { data: products } = await backup.from('products').select('id');
    
    log(`  ✓ Categories: ${categories?.length || 0}`, 'green');
    log(`  ✓ Users: ${users?.length || 0}`, 'green');
    log(`  ✓ Products: ${products?.length || 0}`, 'green');
  } catch (error) {
    log('  ✗ Connection failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    allPassed = false;
  }

  // ═══════════════════════════════════════════════════════════
  // 3. TEST SUPABASE FINANCIAL TABLES
  // ═══════════════════════════════════════════════════════════
  log('\n📡 Testing Supabase Financial Tables...', 'blue');
  
  try {
    const { data: commissionLogs } = await primary.from('commission_logs').select('id');
    const { data: withdrawalRequests } = await primary.from('withdrawal_requests').select('id');
    const { data: earningsSnapshots } = await primary.from('earnings_snapshots').select('id');
    const { data: auditLogs } = await primary.from('audit_logs').select('id');

    log('  ✓ Connection successful', 'green');
    log(`  ✓ commission_logs: ${commissionLogs?.length || 0} rows`, 'green');
    log(`  ✓ withdrawal_requests: ${withdrawalRequests?.length || 0} rows`, 'green');
    log(`  ✓ earnings_snapshots: ${earningsSnapshots?.length || 0} rows`, 'green');
    log(`  ✓ audit_logs: ${auditLogs?.length || 0} rows`, 'green');
  } catch (error) {
    log('  ✗ Failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    allPassed = false;
  }

  // ═══════════════════════════════════════════════════════════
  // 4. TEST UPSTASH REDIS
  // ═══════════════════════════════════════════════════════════
  log('\n📡 Testing Upstash Redis...', 'blue');
  try {
    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    log('  ✓ Connection successful', 'green');
    log(`  ✓ URL: ${process.env.UPSTASH_REDIS_REST_URL}`, 'green');
    log(`  ✓ Response: ${data.result}`, 'green');
  } catch (error) {
    log('  ✗ Connection failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    allPassed = false;
  }

  // ═══════════════════════════════════════════════════════════
  // 5. TEST RESEND EMAIL
  // ═══════════════════════════════════════════════════════════
  log('\n📡 Testing Resend Email API...', 'blue');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (!response.ok && response.status !== 401) {
      throw new Error(`HTTP ${response.status}`);
    }

    log('  ✓ API Key valid', 'green');
    log(`  ✓ From: ${process.env.EMAIL_FROM}`, 'green');
    log(`  ✓ Alert Email: ${process.env.ALERT_EMAIL}`, 'green');
  } catch (error) {
    log('  ✗ Connection failed', 'red');
    log(`  Error: ${error.message}`, 'red');
    allPassed = false;
  }

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(70));
  if (allPassed) {
    log('✅ ALL CONNECTIONS SUCCESSFUL', 'green');
  } else {
    log('❌ SOME CONNECTIONS FAILED', 'red');
  }
  console.log('='.repeat(70) + '\n');

  process.exit(allPassed ? 0 : 1);
}

testConnections();
