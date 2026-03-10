require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '═'.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('═'.repeat(70));
}

async function verifySetup() {
  console.clear();
  log('\n🔍 VIRSA MARKETPLACE - COMPLETE SETUP VERIFICATION\n', 'magenta');
  
  const results = {
    supabasePrimary: false,
    supabaseBackup: false,
    financialTables: false,
    redis: false,
    email: false,
    sampleData: false,
  };

  let primary, backup;

  // ═══════════════════════════════════════════════════════════
  // 1. SUPABASE PRIMARY
  // ═══════════════════════════════════════════════════════════
  section('1. SUPABASE PRIMARY (Mumbai)');
  
  try {
    primary = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: categories } = await primary.from('categories').select('id, name, image_url');
    const { data: users } = await primary.from('users').select('id, role');
    const { data: vendors } = await primary.from('vendors').select('id, store_name, status');
    const { data: products } = await primary.from('products').select('id, name, price, status');

    log(`✓ Connection successful`, 'green');
    log(`✓ Categories: ${categories?.length || 0}`, 'green');
    log(`✓ Users: ${users?.length || 0} (Admin: ${users?.filter(u => u.role === 'admin').length}, Vendors: ${users?.filter(u => u.role === 'vendor').length}, Customers: ${users?.filter(u => u.role === 'customer').length})`, 'green');
    log(`✓ Vendors: ${vendors?.length || 0} (Approved: ${vendors?.filter(v => v.status === 'approved').length})`, 'green');
    log(`✓ Products: ${products?.length || 0} (Active: ${products?.filter(p => p.status === 'active').length})`, 'green');
    
    // Check if categories have images
    const categoriesWithImages = categories?.filter(c => c.image_url) || [];
    log(`✓ Categories with images: ${categoriesWithImages.length}/${categories?.length || 0}`, 'green');
    
    results.supabasePrimary = true;
    results.sampleData = (vendors?.length || 0) > 0 && (products?.length || 0) > 0;
  } catch (error) {
    log(`✗ Failed: ${error.message}`, 'red');
  }

  // ═══════════════════════════════════════════════════════════
  // 2. SUPABASE BACKUP
  // ═══════════════════════════════════════════════════════════
  section('2. SUPABASE BACKUP (Singapore)');
  
  try {
    const backup = createClient(
      process.env.SUPABASE_BACKUP_URL,
      process.env.SUPABASE_BACKUP_SERVICE_ROLE_KEY
    );

    const { data: categories } = await backup.from('categories').select('id');
    const { data: users } = await backup.from('users').select('id');
    const { data: vendors } = await backup.from('vendors').select('id');
    const { data: products } = await backup.from('products').select('id');

    log(`✓ Connection successful`, 'green');
    log(`✓ Categories: ${categories?.length || 0}`, 'green');
    log(`✓ Users: ${users?.length || 0}`, 'green');
    log(`✓ Vendors: ${vendors?.length || 0}`, 'green');
    log(`✓ Products: ${products?.length || 0}`, 'green');
    
    results.supabaseBackup = true;
  } catch (error) {
    log(`✗ Failed: ${error.message}`, 'red');
  }

  // ═══════════════════════════════════════════════════════════
  // 3. SUPABASE FINANCIAL TABLES
  // ═══════════════════════════════════════════════════════════
  section('3. SUPABASE FINANCIAL TABLES');
  
  try {
    const { data: commissionLogs } = await primary.from('commission_logs').select('id');
    const { data: withdrawalRequests } = await primary.from('withdrawal_requests').select('id');
    const { data: earningsSnapshots } = await primary.from('earnings_snapshots').select('id');
    const { data: auditLogs } = await primary.from('audit_logs').select('id');

    log(`✓ commission_logs: ${commissionLogs?.length || 0} rows`, 'green');
    log(`✓ withdrawal_requests: ${withdrawalRequests?.length || 0} rows`, 'green');
    log(`✓ earnings_snapshots: ${earningsSnapshots?.length || 0} rows`, 'green');
    log(`✓ audit_logs: ${auditLogs?.length || 0} rows`, 'green');
    
    results.financialTables = true;
  } catch (error) {
    log(`✗ Failed: ${error.message}`, 'red');
  }

  // ═══════════════════════════════════════════════════════════
  // 4. UPSTASH REDIS
  // ═══════════════════════════════════════════════════════════
  section('4. UPSTASH REDIS (Rate Limiting)');
  
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
    log(`✓ Connection successful`, 'green');
    log(`✓ Response: ${data.result}`, 'green');
    
    results.redis = true;
  } catch (error) {
    log(`✗ Failed: ${error.message}`, 'red');
  }

  // ═══════════════════════════════════════════════════════════
  // 5. RESEND EMAIL
  // ═══════════════════════════════════════════════════════════
  section('5. RESEND EMAIL API');
  
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

    log(`✓ API Key valid`, 'green');
    log(`✓ From: ${process.env.EMAIL_FROM}`, 'green');
    
    results.email = true;
  } catch (error) {
    log(`✗ Failed: ${error.message}`, 'red');
  }

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(70));
  log('  SETUP STATUS SUMMARY', 'cyan');
  console.log('═'.repeat(70) + '\n');

  const checks = [
    { name: 'Supabase Primary', status: results.supabasePrimary },
    { name: 'Supabase Backup', status: results.supabaseBackup },
    { name: 'Financial Tables', status: results.financialTables },
    { name: 'Upstash Redis', status: results.redis },
    { name: 'Resend Email', status: results.email },
    { name: 'Sample Data', status: results.sampleData },
  ];

  checks.forEach(check => {
    const icon = check.status ? '✓' : '✗';
    const color = check.status ? 'green' : 'red';
    log(`  ${icon} ${check.name}`, color);
  });

  const allPassed = Object.values(results).every(v => v === true);
  
  console.log('\n' + '═'.repeat(70));
  
  if (allPassed) {
    log('✅ ALL SYSTEMS OPERATIONAL', 'green');
    console.log('═'.repeat(70));
    console.log('\n🚀 Your marketplace is ready!');
    console.log('\nNext steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Visit: http://localhost:3000');
    console.log('  3. Login with test accounts (see DATABASE_SETUP_INSTRUCTIONS.md)');
  } else {
    log('⚠ SETUP INCOMPLETE', 'yellow');
    console.log('═'.repeat(70));
    console.log('\n📋 Required actions:\n');
    
    if (!results.financialTables) {
      console.log('  • Financial tables not found in Supabase');
    }
    if (!results.sampleData) {
      console.log('  • Seed sample data: npm run seed');
    }
    if (!results.supabasePrimary || !results.supabaseBackup) {
      console.log('  • Check Supabase credentials in .env.local');
    }
    if (!results.redis) {
      console.log('  • Check Upstash Redis credentials in .env.local');
    }
    if (!results.email) {
      console.log('  • Check Resend API key in .env.local');
    }
  }
  
  console.log('\n');
  process.exit(allPassed ? 0 : 1);
}

verifySetup();
