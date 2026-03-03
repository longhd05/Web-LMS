import {
  type DocHieuContent,
  type LibraryCategory,
  type LibraryItem,
  type TichHopContent,
  type ThuVienXanhMode,
} from '../types/thuVienXanh'

export const thuVienXanhCategories: LibraryCategory[] = [
  {
    id: 'env',
    title: 'GIÁO DỤC VỀ MÔI TRƯỜNG',
    items: [
      { id: 'vb1', title: 'Tên văn bản 1', categoryId: 'env', hasDocHieu: true, hasTichHop: true },
      { id: 'vb2', title: 'Tên văn bản 2', categoryId: 'env', hasDocHieu: true, hasTichHop: false },
    ],
  },
  {
    id: 'peace',
    title: 'GIÁO DỤC VỀ HÒA BÌNH VÀ GIẢI QUYẾT XUNG ĐỘT',
    items: [
      { id: 'vb3', title: 'Tên văn bản 3', categoryId: 'peace', hasDocHieu: true, hasTichHop: true },
    ],
  },
]

export const docHieuByItemId: Record<string, DocHieuContent> = {
  vb1: {
    itemId: 'vb1',
    passageTitle: 'Tên đoạn trích',
    passageContent:
      'Nội dung ngữ liệu (mock)... Đây là phần văn bản dùng để học sinh đọc, phân tích và trả lời câu hỏi theo yêu cầu bài học.',
    passageImageUrl: null,
    mcq: [{ id: 'q1', question: 'Câu 1 ...?', options: ['A', 'B', 'C', 'D'], correctAnswer: null }],
  },
  vb2: {
    itemId: 'vb2',
    passageTitle: 'Tên đoạn trích',
    passageContent:
      'Nội dung ngữ liệu (mock) cho văn bản 2. Phần này có thể thay bằng rich text từ backend sau.',
    passageImageUrl: null,
    mcq: [
      {
        id: 'q1',
        question: 'Câu 1 văn bản 2 ...?',
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: null,
      },
    ],
  },
  vb3: {
    itemId: 'vb3',
    passageTitle: 'Tên đoạn trích',
    passageContent:
      'Nội dung ngữ liệu (mock) cho văn bản 3. Học sinh đọc kĩ trước khi làm các phần trắc nghiệm và tự luận.',
    passageImageUrl: null,
    mcq: [
      {
        id: 'q1',
        question: 'Câu 1 văn bản 3 ...?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: null,
      },
    ],
  },
}

export const tichHopByItemId: Record<string, TichHopContent> = {
  vb1: {
    itemId: 'vb1',
    passageTitle: 'Tên đoạn trích',
    passageContent:
      'Nội dung ngữ liệu (mock)... Đây là đoạn văn bản nền để học sinh liên hệ và hoàn thành bài viết tích hợp.',
    passageImageUrl: null,
    integrationPrompt: 'Đề bài: abcxyz',
  },
  vb3: {
    itemId: 'vb3',
    passageTitle: 'Tên đoạn trích',
    passageContent: 'Nội dung ngữ liệu (mock) cho bài tích hợp văn bản 3.',
    passageImageUrl: null,
    integrationPrompt: 'Đề bài: Hãy trình bày quan điểm của em và đề xuất giải pháp cụ thể.',
  },
}

export function filterCategoriesBySearch(categories: LibraryCategory[], search: string): LibraryCategory[] {
  const keyword = search.trim().toLowerCase()
  if (!keyword) return categories
  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.title.toLowerCase().includes(keyword)),
    }))
    .filter((category) => category.items.length > 0)
}

export function canOpenByMode(item: LibraryItem, mode: ThuVienXanhMode): boolean {
  return mode === 'doc-hieu' ? item.hasDocHieu : item.hasTichHop
}

export function getDefaultItemId(mode: ThuVienXanhMode): string | null {
  const allItems = thuVienXanhCategories.flatMap((category) => category.items)
  const firstMatch = allItems.find((item) => canOpenByMode(item, mode))
  return firstMatch?.id ?? null
}
