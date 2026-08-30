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
  },

  // Cập nhật danh mục phân khúc (Chỉ dành cho Admin)
  update: async (id, { name, description, image }) => {
    const categoryRepository = AppDataSource.getRepository(Category);
    const category = await categoryRepository.findOneBy({ id: Number(id) });

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    if (name) {
      category.name = name;
      category.slug = slugify(name);

      // Kiểm tra xem slug mới có trùng với danh mục khác không
      const existingCategory = await categoryRepository.findOne({
        where: { slug: category.slug },
      });
      if (existingCategory && existingCategory.id !== Number(id)) {
        throw new Error('CATEGORY_EXISTS');
      }
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    return await categoryRepository.save(category);
  },

  // Xóa danh mục phân khúc (Chỉ dành cho Admin)
  delete: async (id) => {
    const categoryRepository = AppDataSource.getRepository(Category);
    const category = await categoryRepository.findOneBy({ id: Number(id) });

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    return await categoryRepository.remove(category);
  }
};
