import { productService } from '../services/product.service.js';

// 1. [GET] /api/v1/products - Lấy danh sách sản phẩm
export const getProducts = async (req, res) => {
  try {
    const result = await productService.getAll(req.query);

    res.status(200).json({
      status: 'success',
      page: result.pageNum,
      limit: result.limitNum,
      totalCount: result.total,
      totalPages: Math.ceil(result.total / result.limitNum),
      results: result.products.length,
      data: {
        products: result.products,
      },
    });
  } catch (error) {
    console.error('Lỗi getProducts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi lấy danh sách sản phẩm!',
    });
  }
};

// 2. [GET] /api/v1/products/:slug - Lấy chi tiết 1 sản phẩm theo Slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getBySlug(slug);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy sản phẩm này!',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error('Lỗi getProductBySlug:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi lấy chi tiết sản phẩm!',
    });
  }
};

// 3. [POST] /api/v1/products - Tạo sản phẩm mới (Chỉ Admin)
export const createProduct = async (req, res) => {
  try {
    const savedProduct = await productService.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Tạo sản phẩm mới thành công! 🎉',
      data: {
        product: savedProduct,
      },
    });
  } catch (error) {
    console.error('Lỗi createProduct:', error);
    
    if (error.message === 'MISSING_FIELDS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên, giá bán và danh mục là thông tin bắt buộc!',
      });
    }
    if (error.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Danh mục được chọn không tồn tại!',
      });
    }
    if (error.message === 'PRODUCT_EXISTS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên sản phẩm này đã được sử dụng (slug trùng lặp)!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi tạo sản phẩm!',
    });
  }
};

// 4. [PUT] /api/v1/products/:id - Cập nhật thông tin xe hơi (Chỉ Admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await productService.update(id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thông tin xe hơi thành công!',
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    console.error('Lỗi updateProduct:', error);

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy xe hơi cần cập nhật!',
      });
    }
    if (error.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Danh mục phân khúc mới không tồn tại!',
      });
    }
    if (error.message === 'PRODUCT_EXISTS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên xe hơi mới bị trùng với một xe khác đã có!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi cập nhật xe hơi!',
    });
  }
};

// 5. [DELETE] /api/v1/products/:id - Xóa xe hơi khỏi Showroom (Chỉ Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa xe hơi khỏi Showroom thành công!',
    });
  } catch (error) {
    console.error('Lỗi deleteProduct:', error);

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy xe hơi cần xóa!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi xóa xe hơi!',
    });
  }
};
