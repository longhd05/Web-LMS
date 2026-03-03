/**
 * Chuẩn hóa chuỗi tiếng Việt để so sánh
 * VD: "Cầu vồng" -> "cau vong"
 */
export function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Tách dấu ra khỏi chữ
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
}

/**
 * Kiểm tra chuỗi A có chứa chuỗi B (không phân biệt dấu)
 */
export function vietnameseIncludes(text: string, search: string): boolean {
  return normalizeVietnamese(text).includes(normalizeVietnamese(search))
}