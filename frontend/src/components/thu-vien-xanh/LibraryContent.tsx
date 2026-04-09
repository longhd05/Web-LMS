import { useState } from 'react'
import { type LibraryCategory, type LibraryItem, type ThuVienXanhMode } from '../../types/thuVienXanh'

type ThuVienXanhSection = 'hoc-lieu' | 'van-ban-va-nhiem-vu'
type HocLieuDocKey =
  | 'lqh-hoa-binh'
  | 'lqh-moi-truong'
  | 'khvt-tri-thuc-the-loai'
  | 'khvt-ky-nang-va-chien-thuat'

interface HocLieuItem {
  id: string
  title: string
  docKey?: HocLieuDocKey
}

interface HocLieuCategory {
  id: string
  title: string
  items: HocLieuItem[]
}

interface LibraryContentProps {
  categories: LibraryCategory[]
  mode: ThuVienXanhMode
  section: ThuVienXanhSection
  onSectionChange: (section: ThuVienXanhSection) => void
  onModeChange: (mode: ThuVienXanhMode) => void
  onOpenItem: (item: LibraryItem) => void
  onOpenHocLieuItem: (item: HocLieuItem) => void
}

const clickableVanBanItemIds = new Set(['t_env_01'])

const hocLieuCategories: HocLieuCategory[] = [
  {
    id: 'khvt-learning',
    title: 'HỌC LIỆU VỀ TRUYỆN KHVT',
    items: [
      { id: 'khvt-1', title: 'Tri thức thể loại', docKey: 'khvt-tri-thuc-the-loai' },
      { id: 'khvt-2', title: 'Chiến thuật/kĩ thuật đọc hiểu', docKey: 'khvt-ky-nang-va-chien-thuat' },
    ],
  },
  {
    id: 'sustainable-learning',
    title: 'HỌC LIỆU VỀ PHÁT TRIỂN BỀN VỮNG',
    items: [
      { id: 'sdg-1', title: 'Thông điệp từ LHQ về hoà bình', docKey: 'lqh-hoa-binh' },
      { id: 'sdg-2', title: 'Thông điệp từ LHQ về môi trường', docKey: 'lqh-moi-truong' },
    ],
  },
]

export default function LibraryContent({
  categories,
  mode,
  section,
  onSectionChange,
  onModeChange,
  onOpenItem,
  onOpenHocLieuItem,
}: LibraryContentProps) {
  const isEmpty = categories.length === 0
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const desktopGridColsClass = categories.length <= 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
  const isHocLieuSection = section === 'hoc-lieu'

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex justify-center mb-10 sm:mb-12 md:mb-14">
        <h1
          className="w-full text-center text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-wide text-[#123f92]"
          style={{
            WebkitTextStroke: '2px #e8f7ff',
            textShadow: '0 0 1px #e8f7ff, 0 2px 0 rgba(17, 53, 120, 0.2)',
          }}
        >
          THƯ VIỆN KHOA HỌC VIỄN TƯỞNG
        </h1>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-2xl border-2 border-[#123f92] bg-white/95 p-1.5 shadow-md">
          <button
            type="button"
            onClick={() => onSectionChange('hoc-lieu')}
            className={[
              'min-w-[180px] sm:min-w-[260px] rounded-xl px-6 py-3 text-base sm:text-lg font-extrabold transition',
              section === 'hoc-lieu' ? 'bg-[#123f92] text-white' : 'text-[#123f92] hover:bg-[#e8f2ff]',
            ].join(' ')}
          >
            Học liệu
          </button>
          <button
            type="button"
            onClick={() => onSectionChange('van-ban-va-nhiem-vu')}
            className={[
              'min-w-[180px] sm:min-w-[260px] rounded-xl px-6 py-3 text-base sm:text-lg font-extrabold transition',
              section === 'van-ban-va-nhiem-vu' ? 'bg-[#123f92] text-white' : 'text-[#123f92] hover:bg-[#e8f2ff]',
            ].join(' ')}
          >
            Văn bản và nhiệm vụ
          </button>
        </div>
      </div>

      {isHocLieuSection ? (
        <div className="relative mt-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-1">
            {hocLieuCategories.map((category) => (
              <article
                key={category.id}
                className="relative w-full max-w-[400px] mx-auto rounded-[22px] bg-white/90 border border-cyan-200 px-4 pb-5 pt-16 sm:px-5 sm:pb-5 sm:pt-20"
              >
                <div className="absolute left-1/2 -top-5 sm:-top-6 -translate-x-1/2 w-[calc(100%+2.5rem)] sm:w-[calc(100%+2.5rem)] h-[78px] sm:h-[88px]">
                  <span className="absolute -left-2.5 top-8 h-4 w-4 rounded-full bg-[#114795]" />
                  <span className="absolute -right-2.5 top-8 h-4 w-4 rounded-full bg-[#114795]" />

                  <div className="relative h-[72px] sm:h-[84px] rounded-[20px] sm:rounded-[22px] bg-gradient-to-b from-[#2265b4] to-[#1a569f] p-1.5">
                    <div className="h-full rounded-[16px] sm:rounded-[18px] border-[3px] border-[#17d7d9] px-3 sm:px-4 flex items-center justify-center">
                      <h2 className="text-center text-[13px] sm:text-[15px] md:text-base font-black text-white uppercase tracking-[0.03em] leading-tight">
                        {category.title}
                      </h2>
                    </div>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {category.items.map((item) => (
                    <li key={item.id}>
                      {item.docKey ? (
                        <button
                          type="button"
                          onClick={() => onOpenHocLieuItem(item)}
                          className="w-full cursor-pointer rounded-xl bg-cyan-50 px-3.5 py-2.5 text-left font-semibold text-slate-800 transition hover:bg-cyan-100"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span>{item.title}</span>
                            <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-cyan-700">
                              Xem
                            </span>
                          </span>
                        </button>
                      ) : (
                        <div className="rounded-xl bg-cyan-50 px-3.5 py-2.5 font-semibold text-slate-800">{item.title}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="mt-10 rounded-2xl bg-white p-8 text-center text-slate-600 border border-cyan-200">
          Không có văn bản phù hợp với từ khóa tìm kiếm.
        </div>
      ) : (
        <div className="relative mt-7">
          <div className="mx-auto mb-4 w-fit lg:mb-0 lg:absolute lg:right-[-108px] lg:top-[124px] z-10">
            <div className="inline-flex flex-col rounded-2xl overflow-hidden border border-cyan-300 bg-white/95 shadow-sm">
              <button
                onClick={() => onModeChange('doc-hieu')}
                className={`px-6 py-2 text-lg font-bold transition ${
                  mode === 'doc-hieu' ? 'bg-slate-100 text-blue-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Đọc hiểu
              </button>
              <button
                onClick={() => onModeChange('tich-hop')}
                className={[
                  'border-t border-cyan-200 px-6 py-2 text-lg font-bold transition flex items-center gap-1.5 justify-center',
                  mode === 'tich-hop'
                    ? 'bg-slate-100 text-blue-800'
                    : 'text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                Tích hợp
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${desktopGridColsClass} gap-1 lg:gap-1`}>
          {categories.map((category) => {
            const isExpanded = !!expandedCategories[category.id]
            const hasMoreThanTen = category.items.length > 10
            const visibleItems = isExpanded ? category.items : category.items.slice(0, 10)

            return (
              <article
                key={category.id}
                className="relative w-full max-w-[400px] mx-auto rounded-[22px] bg-white/90 border border-cyan-200 px-4 pb-5 pt-16 sm:px-5 sm:pb-5 sm:pt-20"
              >
                <div className="absolute left-1/2 -top-5 sm:-top-6 -translate-x-1/2 w-[calc(100%+2.5rem)] sm:w-[calc(100%+2.5rem)] h-[78px] sm:h-[88px]">
                  <span className="absolute -left-2.5 top-8 h-4 w-4 rounded-full bg-[#114795]" />
                  <span className="absolute -right-2.5 top-8 h-4 w-4 rounded-full bg-[#114795]" />

                  <div className="relative h-[72px] sm:h-[84px] rounded-[20px] sm:rounded-[22px] bg-gradient-to-b from-[#2265b4] to-[#1a569f] p-1.5">
                    <div className="h-full rounded-[16px] sm:rounded-[18px] border-[3px] border-[#17d7d9] px-3 sm:px-4 flex items-center justify-center">
                      <h2 className="text-center text-[13px] sm:text-[15px] md:text-base font-black text-white uppercase tracking-[0.03em] leading-tight">
                        {category.title}
                      </h2>
                    </div>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {visibleItems.map((item) => (
                  <li key={item.id}>
                    {clickableVanBanItemIds.has(item.id) ? (
                      <button
                        onClick={() => onOpenItem(item)}
                        className="w-full text-left rounded-xl bg-cyan-50 hover:bg-cyan-100 px-3.5 py-2.5 font-semibold text-slate-800 transition"
                      >
                        <span>{item.title}</span>
                      </button>
                    ) : (
                      <div className="w-full rounded-xl bg-cyan-50 px-3.5 py-2.5 font-semibold text-slate-800">
                        <span>{item.title}</span>
                      </div>
                    )}
                  </li>
                ))}
                </ul>

                {hasMoreThanTen && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCategories((previous) => ({
                          ...previous,
                          [category.id]: !isExpanded,
                        }))
                      }
                      className="px-4 py-1.5 rounded-full text-sm font-bold border border-cyan-300 text-cyan-700 bg-cyan-50 hover:bg-cyan-100"
                    >
                      {isExpanded ? 'Thu gọn' : 'Tất cả'}
                    </button>
                  </div>
                )}
              </article>
            )
          })}
          </div>
        </div>
      )}
    </section>
  )
}


