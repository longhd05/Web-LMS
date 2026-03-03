import { type ThuVienXanhCategory, type ThuVienXanhTextItem } from '../types/thuVienXanhLibrary'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const useMock = !BASE_URL

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
      title: 'Giọt nước',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: false,
    },
    {
      id: 't_env_03',
      title: 'Rừng xanh',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: 'Dễ',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_env_04',
      title: 'Biển cả',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: false,
      hasIntegratedTask: true,
    },
    {
      id: 't_env_05',
      title: 'Núi non',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: 'Trung bình',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_env_06',
      title: 'Sông suối',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: false,
    },
    {
      id: 't_env_07',
      title: 'Khí hậu',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: 'Khó',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_env_08',
      title: 'Sinh thái',
      type: 'Văn bản',
      categoryId: 'env',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: false,
      hasIntegratedTask: true,
    },
  ],
  peace: [
    {
      id: 't_peace_01',
      title: 'Cầu vồng',
      type: 'Sách được chọn',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: false,
      hasIntegratedTask: true,
    },
    {
      id: 't_peace_02',
      title: 'Hòa bình',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: 'Trung bình',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_peace_03',
      title: 'Hợp tác',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: false,
    },
    {
      id: 't_peace_04',
      title: 'Đoàn kết',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: 'Dễ',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_peace_05',
      title: 'Giải quyết xung đột',
      type: 'Văn bản',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: 'Khó',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_peace_06',
      title: 'Văn hóa hòa bình',
      type: 'Sách được chọn',
      categoryId: 'peace',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: false,
      hasIntegratedTask: true,
    },
  ],
  rights: [
    {
      id: 't_rights_01',
      title: 'Quyền được sống',
      type: 'Sách được chọn',
      categoryId: 'rights',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_rights_02',
      title: 'Bình đẳng',
      type: 'Văn bản',
      categoryId: 'rights',
      coverUrl: null,
      difficulty: 'Khó',
      hasReadingQuiz: true,
      hasIntegratedTask: false,
    },
    {
      id: 't_rights_03',
      title: 'Tự do',
      type: 'Văn bản',
      categoryId: 'rights',
      coverUrl: null,
      difficulty: 'Trung bình',
      hasReadingQuiz: true,
      hasIntegratedTask: true,
    },
    {
      id: 't_rights_04',
      title: 'Nhân quyền phổ quát',
      type: 'Sách được chọn',
      categoryId: 'rights',
      coverUrl: null,
      difficulty: null,
      hasReadingQuiz: false,
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
  {
    id: 'rights',
    name: 'Giáo dục về nhân quyền',
    color: '#2f6f7e',
    textCount: mockTextsByCategory.rights?.length || 0,
  },
]

export const fetchThuVienXanhCategories = async (query?: string): Promise<ThuVienXanhCategory[]> => {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockCategories
  }

  const response = await fetch(`${BASE_URL}/api/thu-vien-xanh/categories${query ? `?q=${encodeURIComponent(query)}` : ''}`)
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
    `${BASE_URL}/api/thu-vien-xanh/categories/${categoryId}/texts${queryString ? `?${queryString}` : ''}`,
  )
  if (!response.ok) {
    throw new Error('Không thể tải danh sách văn bản thư viện xanh')
  }
  return response.json()
}
