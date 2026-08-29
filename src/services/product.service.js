import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';
import { Category } from '../entities/Category.js';
import { slugify } from '../utils/slugify.js';

export const productService = {
  // 1. Lấy danh sách sản phẩm xe hơi (Hỗ trợ Lọc, Tìm kiếm, Phân trang, Sắp xếp)
  getAll: async (queryFilters) => {
    const {
      search,
      category,
      brand,
      nicotine,
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
      .leftJoinAndSelect('product.category', 'category');

    // 🔍 Tìm kiếm
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.brand ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // 📂 Lọc phân khúc (Category)
    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    // 🏷️ Hãng xe (Brand)
    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    // ⚡ Động cơ/Pin (Nicotine cũ)
    if (nicotine) {
      queryBuilder.andWhere('product.nicotine = :nicotine', { nicotine });
    }

    // 💵 Giá bán
    if (minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: Number(minPrice) });
    }
    if (maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: Number(maxPrice) });
    }

    // ⭐ Nổi bật
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: isFeatured === 'true' });
    }

    // ⇅ Sắp xếp
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
      relations: ['category'],
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
      brand,
      nicotine,
      flavor,
      isFeatured,
      categoryId,
    } = productData;

    if (!name || !price || !categoryId) {
      throw new Error('MISSING_FIELDS');
    }

    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Kiểm tra danh mục
    const category = await categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
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
      brand,
      nicotine,
      flavor,
      isFeatured,
      category,
    });

    return await productRepository.save(newProduct);
  }
};
