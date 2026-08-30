import { brandService } from '../services/brand.service.js';

export const getBrands = async (req, res) => {
  try {
    const result = await brandService.getAll();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBrand = async (req, res) => {
  try {
    const brand = await brandService.create(req.body);
    res.status(201).json({ success: true, brand });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const brand = await brandService.update(req.params.id, req.body);
    res.status(200).json({ success: true, brand });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    await brandService.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Đã xóa hãng xe thành công!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
