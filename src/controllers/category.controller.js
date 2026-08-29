import { AppDataSource } from '../config/data-source.js';
import { Category } from '../entities/Category.js';
import { slugify } from '../utils/slugify.js';

// 1. [GET] /api/v1/categories - Lấy tất cả danh mục sản phẩm
export const getCategories = async (req, res) => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    const categories = await categoryRepository.find({
      order: { createdAt: 'DESC' },
    });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error('Lỗi getCategories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi lấy danh sách danh mục!',
    });
  }
};

// 2. [POST] /api/v1/categories - Tạo danh mục mới (Chỉ Admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên danh mục không được để trống!',
      });
    }

    const categoryRepository = AppDataSource.getRepository(Category);

    // Kiểm tra tên danh mục trùng lặp
    const slug = slugify(name);
    const existingCategory = await categoryRepository.findOneBy({ slug });
    if (existingCategory) {
      return res.status(400).json({
        status: 'fail',
        message: 'Danh mục này đã tồn tại!',
      });
    }

    const newCategory = categoryRepository.create({
      name,
      slug,
      description,
      image,
    });

    const savedCategory = await categoryRepository.save(newCategory);

    res.status(201).json({
      status: 'success',
      message: 'Tạo danh mục mới thành công! 🎉',
      data: {
        category: savedCategory,
      },
    });
  } catch (error) {
    console.error('Lỗi createCategory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi tạo danh mục!',
    });
  }
};
