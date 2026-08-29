import { AppDataSource } from '../config/data-source.js';
import { Category } from '../entities/Category.js';
import { slugify } from '../utils/slugify.js';

export const categoryService = {
  // Lấy toàn bộ danh mục từ Database
  getAll: async () => {
    const categoryRepository = AppDataSource.getRepository(Category);
    return await categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  },

  // Tạo một danh mục mới (Chỉ dành cho Admin)
  create: async ({ name, description, image }) => {
    if (!name) {
      throw new Error('MISSING_NAME');
    }

    const categoryRepository = AppDataSource.getRepository(Category);
    const slug = slugify(name);

    // Kiểm tra danh mục trùng lặp
    const existingCategory = await categoryRepository.findOneBy({ slug });
    if (existingCategory) {
      throw new Error('CATEGORY_EXISTS');
    }

    const newCategory = categoryRepository.create({
      name,
      slug,
      description,
      image,
    });

    return await categoryRepository.save(newCategory);
  }
};
