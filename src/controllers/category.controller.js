import { categoryService } from '../services/category.service.js';

// 1. [GET] /api/v1/categories - Lấy tất cả danh mục sản phẩm
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAll();

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
    
    // Gọi xuống Service để xử lý tạo danh mục
    const category = await categoryService.create({ name, description, image });

    res.status(201).json({
      status: 'success',
      message: 'Tạo danh mục mới thành công! 🎉',
      data: {
        category,
      },
    });
  } catch (error) {
    console.error('Lỗi createCategory:', error);
    
    if (error.message === 'MISSING_NAME') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên danh mục không được để trống!',
      });
    }
    if (error.message === 'CATEGORY_EXISTS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Danh mục này đã tồn tại!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi tạo danh mục!',
    });
  }
};
