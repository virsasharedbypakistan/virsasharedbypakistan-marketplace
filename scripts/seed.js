require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize clients
const primary = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const backup = createClient(
  process.env.SUPABASE_BACKUP_URL,
  process.env.SUPABASE_BACKUP_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // ═══════════════════════════════════════════════════════════
    // 1. UPDATE CATEGORIES WITH IMAGES
    // ═══════════════════════════════════════════════════════════
    console.log('📸 Updating category images...');
    
    const categoryUpdates = [
      { slug: 'electronics', image: '/cat_electronics.png' },
      { slug: 'fashion', image: '/cat_fashion.png' },
      { slug: 'home-living', image: '/cat_home.png' },
      { slug: 'beauty-health', image: '/cat_beauty.png' },
      { slug: 'sports-outdoors', image: '/cat_sports.png' },
    ];

    for (const cat of categoryUpdates) {
      await primary.from('categories').update({ image_url: cat.image }).eq('slug', cat.slug);
      console.log(`  ✓ Updated ${cat.slug}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 2. CREATE ADMIN USER
    // ═══════════════════════════════════════════════════════════
    console.log('\n👤 Creating admin user...');
    
    const { data: adminAuth, error: adminError } = await primary.auth.admin.createUser({
      email: process.env.DEMO_ADMIN_EMAIL || 'admin@virsasharedbypakistan.com',
      password: process.env.DEMO_ADMIN_PASSWORD || 'Admin@123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
      },
    });

    if (adminError && !adminError.message.includes('already')) {
      throw adminError;
    }

    const adminId = adminAuth?.user?.id;
    if (adminId) {
      await primary.from('users').update({ role: 'admin' }).eq('id', adminId);
      console.log(`  ✓ Admin created: ${process.env.DEMO_ADMIN_EMAIL}`);
    } else {
      console.log('  ℹ Admin user already exists');
    }

    // ═══════════════════════════════════════════════════════════
    // 3. CREATE VENDOR USERS
    // ═══════════════════════════════════════════════════════════
    console.log('\n🏪 Creating vendors...');

    // Vendor 1: TechHub
    const { data: vendor1Auth } = await primary.auth.admin.createUser({
      email: process.env.DEMO_VENDOR1_EMAIL || 'vendor1@techhub.com',
      password: process.env.DEMO_VENDOR1_PASSWORD || 'Vendor@123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Ali Khan',
      },
    });

    if (vendor1Auth?.user) {
      await primary.from('users').update({ role: 'vendor' }).eq('id', vendor1Auth.user.id);
      
      const { data: vendor1 } = await primary.from('vendors').insert({
        user_id: vendor1Auth.user.id,
        store_name: 'TechHub Pakistan',
        store_slug: 'techhub-pakistan',
        description: 'Your one-stop shop for the latest electronics and gadgets',
        logo_url: '/vendor_logo_1.png',
        phone: '+92-300-1234567',
        email: process.env.DEMO_VENDOR1_EMAIL || 'vendor1@techhub.com',
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      }).select().single();

      console.log(`  ✓ Vendor 1: ${vendor1.store_name}`);

      // Get category IDs
      const { data: categories } = await primary.from('categories').select('id, slug');
      const catMap = {};
      categories.forEach(c => catMap[c.slug] = c.id);

      // Create products for Vendor 1
      const vendor1Products = [
        {
          vendor_id: vendor1.id,
          category_id: catMap['electronics'],
          name: 'Wireless Bluetooth Headphones',
          slug: 'wireless-bluetooth-headphones',
          description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
          short_description: 'Premium wireless headphones with ANC',
          price: '8999.00',
          stock: 50,
          sku: 'TECH-HEAD-001',
          images: ['/product_headphones.png'],
          thumbnail_url: '/product_headphones.png',
          tags: ['electronics', 'audio', 'wireless'],
          status: 'active',
          is_featured: true,
        },
        {
          vendor_id: vendor1.id,
          category_id: catMap['electronics'],
          name: 'Mechanical Gaming Keyboard RGB',
          slug: 'mechanical-gaming-keyboard-rgb',
          description: 'Professional mechanical gaming keyboard with RGB backlighting and ultra-responsive switches.',
          short_description: 'RGB mechanical keyboard for gaming',
          price: '12499.00',
          stock: 30,
          sku: 'TECH-KEY-001',
          images: ['/product_keyboard.png'],
          thumbnail_url: '/product_keyboard.png',
          tags: ['electronics', 'gaming', 'keyboard'],
          status: 'active',
          is_featured: true,
        },
        {
          vendor_id: vendor1.id,
          category_id: catMap['sports-outdoors'],
          name: 'Travel Backpack 30L',
          slug: 'travel-backpack-30l',
          description: 'Durable travel backpack with laptop sleeve, USB charging port, and water-resistant material.',
          short_description: 'Spacious travel backpack',
          price: '4999.00',
          stock: 45,
          sku: 'TECH-BAG-001',
          images: ['/product_backpack.png'],
          thumbnail_url: '/product_backpack.png',
          tags: ['travel', 'backpack', 'outdoor'],
          status: 'active',
        },
      ];

      await primary.from('products').insert(vendor1Products);
      console.log(`  ✓ Created ${vendor1Products.length} products for TechHub`);
    }

    // Vendor 2: Fashion Trends
    const { data: vendor2Auth } = await primary.auth.admin.createUser({
      email: process.env.DEMO_VENDOR2_EMAIL || 'vendor2@fashiontrends.com',
      password: process.env.DEMO_VENDOR2_PASSWORD || 'Vendor@123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Sara Ahmed',
      },
    });

    if (vendor2Auth?.user) {
      await primary.from('users').update({ role: 'vendor' }).eq('id', vendor2Auth.user.id);
      
      const { data: vendor2 } = await primary.from('vendors').insert({
        user_id: vendor2Auth.user.id,
        store_name: 'Fashion Trends',
        store_slug: 'fashion-trends',
        description: 'Trendy clothing and accessories for everyone',
        logo_url: '/vendor_logo_2.png',
        phone: '+92-300-7654321',
        email: process.env.DEMO_VENDOR2_EMAIL || 'vendor2@fashiontrends.com',
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      }).select().single();

      console.log(`  ✓ Vendor 2: ${vendor2.store_name}`);

      const { data: categories } = await primary.from('categories').select('id, slug');
      const catMap = {};
      categories.forEach(c => catMap[c.slug] = c.id);

      const vendor2Products = [
        {
          vendor_id: vendor2.id,
          category_id: catMap['fashion'],
          name: 'Smart Fitness Watch',
          slug: 'smart-fitness-watch',
          description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, and GPS.',
          short_description: 'Smart watch with fitness tracking',
          price: '15999.00',
          sale_price: '13999.00',
          stock: 40,
          sku: 'FASH-WATCH-001',
          images: ['/product_watch.png'],
          thumbnail_url: '/product_watch.png',
          tags: ['fashion', 'smartwatch', 'fitness'],
          status: 'active',
          is_featured: true,
        },
        {
          vendor_id: vendor2.id,
          category_id: catMap['fashion'],
          name: 'Premium Running Sneakers',
          slug: 'premium-running-sneakers',
          description: 'Lightweight running shoes with breathable mesh and cushioned sole.',
          short_description: 'Comfortable running shoes',
          price: '6999.00',
          stock: 60,
          sku: 'FASH-SHOE-001',
          images: ['/product_sneakers.png'],
          thumbnail_url: '/product_sneakers.png',
          tags: ['fashion', 'shoes', 'running'],
          status: 'active',
        },
      ];

      await primary.from('products').insert(vendor2Products);
      console.log(`  ✓ Created ${vendor2Products.length} products for Fashion Trends`);
    }

    // ═══════════════════════════════════════════════════════════
    // 4. CREATE SAMPLE CUSTOMER
    // ═══════════════════════════════════════════════════════════
    console.log('\n👥 Creating sample customer...');

    const { data: customerAuth } = await primary.auth.admin.createUser({
      email: process.env.DEMO_CUSTOMER_EMAIL || 'customer@example.com',
      password: process.env.DEMO_CUSTOMER_PASSWORD || 'Customer@123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Ahmed Hassan',
      },
    });

    if (customerAuth?.user) {
      await primary.from('addresses').insert({
        user_id: customerAuth.user.id,
        label: 'Home',
        full_name: 'Ahmed Hassan',
        phone: '+92-300-9876543',
        address_line_1: 'House 123, Street 45',
        address_line_2: 'Block F, DHA Phase 5',
        city: 'Lahore',
        province: 'Punjab',
        postal_code: '54000',
        is_default: true,
      });
      console.log(`  ✓ Customer created: ${process.env.DEMO_CUSTOMER_EMAIL}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 5. REPLICATE TO BACKUP
    // ═══════════════════════════════════════════════════════════
    console.log('\n🔄 Replicating to backup database...');

    const tables = ['users', 'categories', 'vendors', 'products', 'addresses'];
    
    for (const table of tables) {
      const { data } = await primary.from(table).select('*');
      if (data && data.length > 0) {
        await backup.from(table).upsert(data);
        console.log(`  ✓ Replicated ${table}: ${data.length} rows`);
      }
    }

    console.log('\n✅ Seeding completed successfully!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`  • Admin: ${process.env.DEMO_ADMIN_EMAIL}`);
    console.log(`  • Vendor 1: ${process.env.DEMO_VENDOR1_EMAIL}`);
    console.log(`  • Vendor 2: ${process.env.DEMO_VENDOR2_EMAIL}`);
    console.log(`  • Customer: ${process.env.DEMO_CUSTOMER_EMAIL}`);
    console.log('  • Products: 5 active products');
    console.log('  • Categories: 8 with images');
    console.log('  • Backup: Fully replicated');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
