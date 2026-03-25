import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://neondb_owner:npg_7aTqABUYtP8H@ep-orange-silence-andwfa1v-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(connectionString);

async function main() {
  console.log('🌱 Starting RAW SQL database seeding...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const now = new Date().toISOString();

  // 1. Seed Admin
  await sql`
    INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") 
    VALUES (gen_random_uuid(), 'Admin User', 'admin@support.uk', ${adminPassword}, 'ADMIN', ${now}, ${now})
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('✅ Admin seeded');

  // 2. Seed Student
  await sql`
    INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") 
    VALUES ('test-student-id', 'John Doe', 'student@example.com', ${studentPassword}, 'STUDENT', ${now}, ${now})
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('✅ Student seeded');

  // 3. Seed CMS
  await sql`
    INSERT INTO "CmsContent" (id, key, value, page, label, "updatedAt")
    VALUES (gen_random_uuid(), 'home_hero_title', 'Empowering Your Future in the UK', 'home', 'Hero Title', ${now})
    ON CONFLICT (key) DO NOTHING
  `;


  console.log('✅ CMS seeded');

  console.log('🚀 Seeding complete!');
}

main().catch(console.error);
