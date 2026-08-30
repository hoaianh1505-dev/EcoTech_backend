import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/data-source.js';
import { Category } from '../entities/Category.js';
import { Product } from '../entities/Product.js';
import { Brand } from '../entities/Brand.js';
import { categoriesData, brandsData } from './data.js';
import { slugify } from '../utils/slugify.js';

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to Database for seeding...');
    await AppDataSource.initialize();
    console.log('✅ Connected successfully!');

    const categoryRepository = AppDataSource.getRepository(Category);
    const productRepository = AppDataSource.getRepository(Product);
    const brandRepository = AppDataSource.getRepository(Brand);

    // 1. Dọn dẹp dữ liệu cũ (Xóa sản phẩm trước để tránh lỗi ràng buộc khóa ngoại)
    console.log('🧹 Clearing old products, categories and brands...');
    await productRepository.createQueryBuilder().delete().execute();
    await categoryRepository.createQueryBuilder().delete().execute();
    await brandRepository.createQueryBuilder().delete().execute();
    console.log('✨ Cleared old data!');

    // 2. Nạp dữ liệu Hãng xe (Sử dụng brandsData định nghĩa sẵn)
    console.log('🏭 Seeding Brands...');
    const savedBrands = [];
    for (const brand of brandsData) {
      const slug = slugify(brand.name);
      const newBrand = brandRepository.create({
        name: brand.name,
        slug,
        logo: brand.logo,
        description: brand.description,
      });
      const savedBrand = await brandRepository.save(newBrand);
      savedBrands.push(savedBrand);
      console.log(`- Created brand: ${savedBrand.name} (${savedBrand.slug})`);
    }

    // 3. Dọn dẹp & Nạp dữ liệu Danh mục
    console.log('📂 Seeding Categories...');
    const savedCategories = [];
    for (const cat of categoriesData) {
      const slug = slugify(cat.name);
      const newCat = categoryRepository.create({
        ...cat,
        slug,
      });
      const savedCat = await categoryRepository.save(newCat);
      savedCategories.push(savedCat);
      console.log(`- Created category: ${savedCat.name} (${savedCat.slug})`);
    }

    console.log('🛒 Product seeding skipped as requested (Products table cleared).');
    console.log('🏁 Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
