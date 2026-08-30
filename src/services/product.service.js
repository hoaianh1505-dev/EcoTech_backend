import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';
import { Category } from '../entities/Category.js';
import { Brand } from '../entities/Brand.js';
import { slugify } from '../utils/slugify.js';

export const productService = {
  // 1. Lấy danh sách sản phẩm xe hơi (Hỗ trợ Lọc, Tìm kiếm, Phân trang, Sắp xếp)
  getAll: async (queryFilters) => {
    const {
      search,
      category,
      brand,
      engine,
      minPrice,
      maxPrice,
      isFeatured,
      sort,
      page = 1,
      limit = 12,
    } = queryFilters;

    const productRepository = AppDataSource.getRepository(Product);
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand');

    // Tìm kiếm (Mở rộng tìm kiếm sang hãng xe brand.name)
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR brand.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Lọc phân khúc (Category)
    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    // Lọc Hãng xe (Brand slug)
    if (brand) {
      queryBuilder.andWhere('brand.slug = :brand', { brand });
    }

    // Động cơ/Pin (Engine mới)
    if (engine) {
      queryBuilder.andWhere('product.engine = :engine', { engine });
    }

    // 💵 Giá bán
    if (minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: Number(minPrice) });
    }
    if (maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: Number(maxPrice) });
    }

    // Nổi bật
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    }

    // Sắp xếp
    if (sort === 'price_asc') {
      queryBuilder.orderBy('product.price', 'ASC');
    } else if (sort === 'price_desc') {
      queryBuilder.orderBy('product.price', 'DESC');
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    // Phân trang
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    queryBuilder.skip(skip).take(limitNum);

    const [products, total] = await queryBuilder.getManyAndCount();
    
    return {
      products,
      total,
      pageNum,
      limitNum,
    };
  },

  // 2. Lấy chi tiết xe qua slug
  getBySlug: async (slug) => {
    const productRepository = AppDataSource.getRepository(Product);
    return await productRepository.findOne({
      where: { slug },
      relations: {
        category: true,
        brand: true
      },
    });
  },

  // 3. Admin tạo xe hơi mới
  create: async (productData) => {
    const {
      name,
      price,
      originalPrice,
      description,
      image,
      images,
      stock,
      brandId,
      engine,
      color,
      isFeatured,
      categoryId,
    } = productData;

    if (!name || !price || !categoryId || !brandId) {
      throw new Error('MISSING_FIELDS');
    }

    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(Category);
    const brandRepository = AppDataSource.getRepository(Brand);

    // Kiểm tra danh mục
    const category = await categoryRepository.findOneBy({ id: Number(categoryId) });
    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // Kiểm tra hãng xe
    const brandObj = await brandRepository.findOneBy({ id: Number(brandId) });
    if (!brandObj) {
      throw new Error('BRAND_NOT_FOUND');
    }

    // Kiểm tra trùng slug
    const slug = slugify(name);
    const existingProduct = await productRepository.findOneBy({ slug });
    if (existingProduct) {
      throw new Error('PRODUCT_EXISTS');
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
      engine,
      color,
      isFeatured,
      category,
      brand: brandObj,
    });

    return await productRepository.save(newProduct);
  },

  // 4. Admin cập nhật thông tin xe hơi
  update: async (id, updateData) => {
    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(Category);
    const brandRepository = AppDataSource.getRepository(Brand);

    const product = await productRepository.findOne({
      where: { id: Number(id) },
      relations: {
        category: true,
        brand: true
      }
    });
    
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const { categoryId, brandId, name, ...rest } = updateData;

    // Nếu cập nhật danh mục phân khúc
    if (categoryId) {
      const category = await categoryRepository.findOneBy({ id: Number(categoryId) });
      if (!category) {
        throw new Error('CATEGORY_NOT_FOUND');
      }
      product.category = category;
    }

    // Nếu cập nhật hãng xe
    if (brandId) {
      const brandObj = await brandRepository.findOneBy({ id: Number(brandId) });
      if (!brandObj) {
        throw new Error('BRAND_NOT_FOUND');
      }
      product.brand = brandObj;
    }

    // Nếu đổi tên xe -> cập nhật lại slug xe
    if (name) {
      product.name = name;
      product.slug = slugify(name);
      
      // Kiểm tra xem slug mới có bị trùng với xe nào khác không
      const existingProduct = await productRepository.findOne({
        where: { slug: product.slug },
      });
      if (existingProduct && existingProduct.id !== Number(id)) {
        throw new Error('PRODUCT_EXISTS');
      }
    }

    // Đổ các dữ liệu còn lại vào
    Object.assign(product, rest);

    return await productRepository.save(product);
  },

  // 5. Admin xóa xe hơi khỏi Showroom
  delete: async (id) => {
    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOneBy({ id: Number(id) });
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    return await productRepository.remove(product);
  }
};
