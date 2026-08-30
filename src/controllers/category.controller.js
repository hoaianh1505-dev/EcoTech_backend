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

// 3. [PUT] /api/v1/categories/:id - Cập nhật danh mục (Chỉ Admin)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const category = await categoryService.update(id, { name, description, image });

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật danh mục phân khúc thành công!',
      data: {
        category,
      },
    });
  } catch (error) {
    console.error('Lỗi updateCategory:', error);

    if (error.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy danh mục phân khúc cần cập nhật!',
      });
    }
    if (error.message === 'CATEGORY_EXISTS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên danh mục phân khúc mới đã tồn tại!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi cập nhật danh mục!',
    });
  }
};

// 4. [DELETE] /api/v1/categories/:id - Xóa danh mục (Chỉ Admin)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Xóa danh mục phân khúc thành công!',
    });
  } catch (error) {
    console.error('Lỗi deleteCategory:', error);

    if (error.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy danh mục phân khúc cần xóa!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi xóa danh mục!',
    });
  }
};
