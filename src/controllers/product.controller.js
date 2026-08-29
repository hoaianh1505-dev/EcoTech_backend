import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';
import { Category } from '../entities/Category.js';
import { slugify } from '../utils/slugify.js';

// 1. [GET] /api/v1/products - Lấy danh sách sản phẩm (Hỗ trợ Lọc, Tìm kiếm, Phân trang, Sắp xếp)
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      nicotine,
      minPrice,
      maxPrice,
      isFeatured,
      sort, // 'price_asc', 'price_desc', 'newest'
      page = 1,
      limit = 12,
    } = req.query;

    const productRepository = AppDataSource.getRepository(Product);
    
    // Sử dụng QueryBuilder để dễ dàng thêm các điều kiện lọc động
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category'); // Join bảng Category để lấy thông tin danh mục

    // 🔍 A. Điều kiện tìm kiếm (Search) theo Tên, Hãng, Hương vị
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.brand ILIKE :search OR product.flavor ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // 📂 B. Lọc theo Slug Danh mục
    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    // 🏷️ C. Lọc theo Thương hiệu
    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    // ⚡ D. Lọc theo nồng độ nicotine
    if (nicotine) {
      queryBuilder.andWhere('product.nicotine = :nicotine', { nicotine });
    }

    // 💵 E. Lọc theo giá bán (Min - Max)
    if (minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: Number(minPrice) });
    }
    if (maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: Number(maxPrice) });
    }

    // ⭐ F. Lọc sản phẩm nổi bật
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    }

    // ⇅ G. Sắp xếp (Sorting)
    if (sort === 'price_asc') {
      queryBuilder.orderBy('product.price', 'ASC');
    } else if (sort === 'price_desc') {
      queryBuilder.orderBy('product.price', 'DESC');
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC'); // Mặc định: Mới nhất lên trước
    }

    // 📄 H. Phân trang (Pagination)
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    queryBuilder.skip(skip).take(limitNum);

    // Chạy truy vấn lấy danh sách và tổng số lượng
    const [products, total] = await queryBuilder.getManyAndCount();

    res.status(200).json({
      status: 'success',
      page: pageNum,
      limit: limitNum,
      totalCount: total,
      totalPages: Math.ceil(total / limitNum),
      results: products.length,
      data: {
        products,
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

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      where: { slug },
      relations: ['category'], // Lấy thông tin danh mục kèm theo
    });

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
    const {
      name,
      price,
      originalPrice,
      description,
      image,
      images,
      stock,
      brand,
      nicotine,
      flavor,
      isFeatured,
      categoryId,
    } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên, giá bán và danh mục là thông tin bắt buộc!',
      });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Kiểm tra Danh mục có tồn tại không
    const category = await categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Danh mục được chọn không tồn tại!',
      });
    }

    // Tạo slug
    const slug = slugify(name);
    const existingProduct = await productRepository.findOneBy({ slug });
    if (existingProduct) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên sản phẩm này đã được sử dụng (slug trùng lặp)!',
      });
    }

    const newProduct = productRepository.create({
      name,
      slug,
      price,
      originalPrice,
      description,
      image,
      images,
      stock,
      brand,
      nicotine,
      flavor,
      isFeatured,
      category, // Gán quan hệ Category
    });

    const savedProduct = await productRepository.save(newProduct);

    res.status(201).json({
      status: 'success',
      message: 'Tạo sản phẩm mới thành công! 🎉',
      data: {
        product: savedProduct,
      },
    });
  } catch (error) {
    console.error('Lỗi createProduct:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi tạo sản phẩm!',
    });
  }
};
