import { useState } from 'react'
import { type LibraryCategory, type LibraryItem, type ThuVienXanhMode } from '../../types/thuVienXanh'

interface LibraryContentProps {
  categories: LibraryCategory[]
  mode: ThuVienXanhMode
  isLoggedIn?: boolean
  onModeChange: (mode: ThuVienXanhMode) => void
  onOpenItem: (item: LibraryItem) => void
}

export default function LibraryContent({ categories, mode, isLoggedIn = true, onModeChange, onOpenItem }: LibraryContentProps) {
  const isEmpty = categories.length === 0
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const desktopGridColsClass = categories.length <= 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'

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

      {isEmpty ? (
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
                    : isLoggedIn
                      ? 'text-slate-700 hover:bg-slate-50'
                      : 'text-slate-400',
                ].join(' ')}
              >
                Tích hợp
                {!isLoggedIn && (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10V7A5 5 0 0 0 7 7v3H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2Zm-5 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3-7H9V7a3 3 0 0 1 6 0v3Z" />
                  </svg>
                )}
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
                    <button
                      onClick={() => onOpenItem(item)}
                      className="w-full text-left rounded-xl bg-cyan-50 hover:bg-cyan-100 px-3.5 py-2.5 font-semibold text-slate-800 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span>{item.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {(mode === 'tich-hop'
                            ? [
                                item.hasTichHop && { key: 'tich-hop', label: 'Tích hợp', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
                                item.hasDocHieu && { key: 'doc-hieu', label: 'Đọc hiểu', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                              ]
                            : [
                                item.hasDocHieu && { key: 'doc-hieu', label: 'Đọc hiểu', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                                item.hasTichHop && { key: 'tich-hop', label: 'Tích hợp', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
                              ]
                          ).map(
                            (badge) =>
                              badge && (
                                <span
                                  key={badge.key}
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.cls}`}
                                >
                                  {badge.label}
                                </span>
                              ),
                          )}
                        </div>
                      </div>
                    </button>
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
