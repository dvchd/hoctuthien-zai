/**
 * Database Seed Script
 * Seeds teaching fields and default data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Teaching Fields
  const teachingFields = [
    {
      name: 'Lập trình & Phát triển phần mềm',
      slug: 'programming',
      description: 'Web development, Mobile apps, Backend, Frontend, DevOps',
      icon: 'Code',
      color: '#3B82F6',
      sortOrder: 1,
    },
    {
      name: 'Khoa học dữ liệu & AI',
      slug: 'data-science',
      description: 'Machine Learning, Deep Learning, Data Analysis, NLP',
      icon: 'Brain',
      color: '#8B5CF6',
      sortOrder: 2,
    },
    {
      name: 'Kinh doanh & Khởi nghiệp',
      slug: 'business',
      description: 'Startup, Marketing, Sales, Strategy, Leadership',
      icon: 'Briefcase',
      color: '#10B981',
      sortOrder: 3,
    },
    {
      name: 'Ngoại ngữ',
      slug: 'language',
      description: 'English, Japanese, Korean, Chinese, IELTS, TOEIC',
      icon: 'Languages',
      color: '#F59E0B',
      sortOrder: 4,
    },
    {
      name: 'Thiết kế & Sáng tạo',
      slug: 'design',
      description: 'UI/UX Design, Graphic Design, Video Editing, Photography',
      icon: 'Palette',
      color: '#EC4899',
      sortOrder: 5,
    },
    {
      name: 'Phát triển bản thân',
      slug: 'personal-development',
      description: 'Communication skills, Time management, Mindfulness',
      icon: 'User',
      color: '#06B6D4',
      sortOrder: 6,
    },
    {
      name: 'Tư vấn nghề nghiệp',
      slug: 'career-coaching',
      description: 'Career path, Interview preparation, CV review',
      icon: 'TrendingUp',
      color: '#F97316',
      sortOrder: 7,
    },
    {
      name: 'Tài chính & Đầu tư',
      slug: 'finance',
      description: 'Personal finance, Stock market, Crypto, Real estate',
      icon: 'DollarSign',
      color: '#22C55E',
      sortOrder: 8,
    },
  ];

  console.log('📚 Seeding teaching fields...');
  for (const field of teachingFields) {
    await prisma.teachingField.upsert({
      where: { slug: field.slug },
      update: field,
      create: field,
    });
    console.log(`  ✓ ${field.name}`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
