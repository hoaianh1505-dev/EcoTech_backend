// Hàm chuyển đổi chuỗi tiếng Việt có dấu thành không dấu và tạo slug
export const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')                   // Tách các dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')     // Xóa bỏ các ký tự dấu đã tách
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')               // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, '')           // Xóa bỏ các ký tự đặc biệt
    .replace(/\-\-+/g, '-');            // Thay thế nhiều dấu gạch ngang liên tiếp bằng 1 dấu
};
