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
    await productRepository.delete({});
    await categoryRepository.delete({});
    console.log('✨ Cleared old data!');

    // 2. Nạp dữ liệu Danh mục
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

    // 3. Nạp dữ liệu Sản phẩm và liên kết với Danh mục tương ứng
    console.log('🛒 Seeding Products...');
    for (const prod of productsData) {
      const matchedCategory = savedCategories.find(c => c.slug === prod.categorySlug);

      if (!matchedCategory) {
        console.warn(`⚠️ Warning: Category with slug '${prod.categorySlug}' not found. Skipping product: ${prod.name}`);
        continue;
      }

      const slug = slugify(prod.name);
      const newProd = productRepository.create({
        name: prod.name,
        slug,
        price: prod.price,
        originalPrice: prod.originalPrice,
        description: prod.description,
        image: prod.image,
        stock: prod.stock,
        brand: prod.brand,
        nicotine: prod.nicotine,
        flavor: prod.flavor,
        isFeatured: prod.isFeatured,
        category: matchedCategory,
      });

      const savedProd = await productRepository.save(newProd);
      console.log(`- Created product: ${savedProd.name} (Slug: ${savedProd.slug})`);
    }

    console.log('🏁 Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
