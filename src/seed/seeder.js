import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/data-source.js';
import { Category } from '../entities/Category.js';
import { Product } from '../entities/Product.js';
import { categoriesData, productsData } from './data.js';
import { slugify } from '../utils/slugify.js';

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to Database for seeding...');
    await AppDataSource.initialize();
    console.log('✅ Connected successfully!');

    const categoryRepository = AppDataSource.getRepository(Category);
    const productRepository = AppDataSource.getRepository(Product);

    // 1. Dọn dẹp dữ liệu cũ (Xóa sản phẩm trước để tránh lỗi ràng buộc khóa ngoại)
    console.log('🧹 Clearing old products and categories...');
    await productRepository.createQueryBuilder().delete().execute();
    await categoryRepository.createQueryBuilder().delete().execute();
    console.log('✨ Cleared old data!');

    // 2. Nạp dữ liệu Danh mục / Phân khúc VinFast
    console.log('📂 Seeding Categories...');
    const categoryMap = {};
    for (const cat of categoriesData) {
      const slug = slugify(cat.name);
      const newCat = categoryRepository.create({
        ...cat,
        slug,
      });
      const savedCat = await categoryRepository.save(newCat);
      categoryMap[cat.name] = savedCat;
      console.log(`- Created category: ${savedCat.name} (${savedCat.slug})`);
    }

    // 3. Nạp dữ liệu Dòng xe VinFast thực tế (Không gán ảnh sẵn để bro tự upload)
    console.log('🚗 Seeding VinFast Electric Vehicles...');
    for (const prod of productsData) {
      const { categoryName, ...prodFields } = prod;
      const category = categoryMap[categoryName];
      const slug = slugify(prod.name);

      const newProduct = productRepository.create({
        ...prodFields,
        slug,
        category,
      });
      const savedProduct = await productRepository.save(newProduct);
      console.log(`- Created car: ${savedProduct.name} (${savedProduct.slug}) - ${Number(savedProduct.price).toLocaleString('vi-VN')}đ`);
    }

    console.log('🏁 Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
