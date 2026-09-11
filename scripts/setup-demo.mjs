#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupDemo() {
  console.log('🚀 Setting up SoleMate Demo...\n');

  try {
    // 1. Create CUSTOMER account
    console.log('📧 Creating CUSTOMER account...');
    const customerEmail = 'nam@solemate-demo.com';
    const customerPassword = 'Nam123!';

    let customerData = await supabase.auth.admin.createUser({
      email: customerEmail,
      password: customerPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Nam',
        role: 'CUSTOMER'
      }
    });

    if (customerData.error) {
      if (customerData.error.message.includes('already exists')) {
        console.log('✓ CUSTOMER already exists');
        // Fetch existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        customerData = {
          data: {
            user: existingUsers?.users?.find(u => u.email === customerEmail)
          }
        };
      } else {
        throw customerData.error;
      }
    } else {
      console.log('✓ CUSTOMER created:', customerEmail);
    }

    const customerId = customerData.data?.user?.id;

    // Create customer profile
    if (customerId) {
      await supabase.from('profiles').upsert({
        id: customerId,
        email: customerEmail,
        display_name: 'Nam',
        role: 'CUSTOMER',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      console.log('✓ CUSTOMER profile created');
    }

    // 2. Create ADMIN account
    console.log('\n📧 Creating ADMIN account...');
    const adminEmail = 'admin@solemate-demo.com';
    const adminPassword = 'Admin123!';

    let adminData = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Admin',
        role: 'ADMIN'
      }
    });

    if (adminData.error) {
      if (adminData.error.message.includes('already exists')) {
        console.log('✓ ADMIN already exists');
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        adminData = {
          data: {
            user: existingUsers?.users?.find(u => u.email === adminEmail)
          }
        };
      } else {
        throw adminData.error;
      }
    } else {
      console.log('✓ ADMIN created:', adminEmail);
    }

    const adminId = adminData.data?.user?.id;

    // Create admin profile
    if (adminId) {
      await supabase.from('profiles').upsert({
        id: adminId,
        email: adminEmail,
        display_name: 'Admin',
        role: 'ADMIN',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      console.log('✓ ADMIN profile created');
    }

    // 3. Check if seed data exists
    console.log('\n📦 Checking seed data...');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id')
      .limit(1);

    if (brandsError) {
      console.error('Error checking brands:', brandsError);
    } else if (brands && brands.length > 0) {
      console.log('✓ Seed data already exists');
    } else {
      console.log('⚠ No seed data found - please run migrations manually in Supabase dashboard');
    }

    console.log('\n✅ Demo setup complete!\n');
    console.log('CUSTOMER LOGIN:');
    console.log(`  Email: ${customerEmail}`);
    console.log(`  Password: ${customerPassword}\n`);
    console.log('ADMIN LOGIN:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDemo();
