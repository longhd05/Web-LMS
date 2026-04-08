import { type ThuVienXanhCategory, type ThuVienXanhTextItem } from '../types/thuVienXanhLibrary'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const useMock = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

function normalizeVietnamese(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
}

function vietnameseIncludes(text: string, search: string): boolean {
  return normalizeVietnamese(text).includes(normalizeVietnamese(search))
}

const mockTextsByCategory: Record<string, ThuVienXanhTextItem[]> = {
  env: [
    {
      id: 't_env_01',
      title: 'Bạch tuộc',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: 'Trung bình',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_env_02',
      title: 'Dạo chơi dưới đáy biển',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: false,
    },
    {
      id: 't_env_03',
      title: 'Cá nhà tàng và cá voi',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: 'Dễ',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_env_04',
      title: 'Đường vào trung tâm vũ trụ',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_env_05',
      title: 'Sự hi sinh của Joe',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: 'Trung bình',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
  ],
  peace: [
    {
      id: 't_peace_01',
      title: 'Tàu Victoria xuất hành',
      type: 'Sách được chọn',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_peace_02',
      title: 'Nghĩa địa khổng lồ',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: 'Trung bình',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_peace_03',
      title: 'Chất làm gỉ',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: false,
    },
    {
      id: 't_peace_04',
      title: 'Hành tinh kì lạ',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: 'Dễ',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_peace_05',
      title: 'Giờ bắt đầu',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: 'Khó',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
  ],
}

const mockCategories: ThuVienXanhCategory[] = [
  {
    id: 'env',
    name: 'Giáo dục về môi trường',
    color: '#60d394',
    textCount: mockTextsByCategory.env?.length || 0,
  },
  {
    id: 'peace',
    name: 'Giáo dục về hòa bình và giải quyết xung đột',
    color: '#73a9ff',
    textCount: mockTextsByCategory.peace?.length || 0,
  },
]

export const fetchThuVienXanhCategories = async (query?: string): Promise<ThuVienXanhCategory[]> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockCategories
  }

  const response = await fetch(`${BASE_URL}/thu-vien-xanh/categories${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  if (!response.ok) {
    throw new Error('Không thể tải danh mục thư viện xanh')
  }
  return response.json()
}

export const fetchThuVienXanhTextsByCategory = async (
  categoryId: string,
  query?: string,
  limit?: number,
): Promise<ThuVienXanhTextItem[]> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const texts = mockTextsByCategory[categoryId] || []
    const filtered = query
      ? texts.filter((item) => vietnameseIncludes(item.title, query))
      : texts
    return limit ? filtered.slice(0, limit) : filtered
  }

  const search = new URLSearchParams()
  if (query) search.set('q', query)
  if (typeof limit === 'number') search.set('limit', String(limit))
  const queryString = search.toString()

  const response = await fetch(
    `${BASE_URL}/thu-vien-xanh/categories/${categoryId}/texts${queryString ? `?${queryString}` : ''}`,
  )
  if (!response.ok) {
    throw new Error('Không thể tải danh sách văn bản thư viện xanh')
  }
  return response.json()
}
