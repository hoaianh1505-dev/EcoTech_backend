import { AppDataSource } from '../config/data-source.js';
import { Brand } from '../entities/Brand.js';
import { slugify } from '../utils/slugify.js';

const brandRepository = AppDataSource.getRepository(Brand);

export const brandService = {
  // 1. Lấy toàn bộ danh sách Hãng xe
  getAll: async () => {
    const brands = await brandRepository.find({
      order: { name: 'ASC' }
    });
    return { success: true, categories: brands }; // Để đồng bộ với frontend gọi
  },

  // 2. Lấy chi tiết một hãng theo ID
  getById: async (id) => {
    return await brandRepository.findOneBy({ id: Number(id) });
  },

  // 3. Tạo hãng xe mới
  create: async (data) => {
    const { name, logo, description } = data;
    const slug = slugify(name);

    // Kiểm tra trùng lặp
    const exist = await brandRepository.findOneBy({ slug });
    if (exist) {
      throw new Error('Hãng xe này đã tồn tại trên hệ thống!');
    }

    const newBrand = brandRepository.create({
      name,
      slug,
      logo,
      description
    });

    return await brandRepository.save(newBrand);
  },

  // 4. Cập nhật hãng xe
  update: async (id, data) => {
    const brand = await brandRepository.findOneBy({ id: Number(id) });
    if (!brand) throw new Error('Không tìm thấy hãng xe yêu cầu!');

    const { name, logo, description } = data;
    if (name && name !== brand.name) {
      const slug = slugify(name);
      const exist = await brandRepository.findOneBy({ slug });
      if (exist && exist.id !== brand.id) {
        throw new Error('Tên hãng xe mới đã trùng lặp!');
      }
      brand.name = name;
      brand.slug = slug;
    }

    if (logo !== undefined) brand.logo = logo;
    if (description !== undefined) brand.description = description;

    return await brandRepository.save(brand);
  },

  // 5. Xóa hãng xe
  delete: async (id) => {
    const brand = await brandRepository.findOneBy({ id: Number(id) });
    if (!brand) throw new Error('Không tìm thấy hãng xe yêu cầu!');
    return await brandRepository.remove(brand);
  }
};
