import { useState } from 'react'
import { type LibraryCategory, type LibraryItem, type ThuVienXanhMode } from '../../types/thuVienXanh'

interface LibraryContentProps {
  categories: LibraryCategory[]
  onOpenItem: (item: LibraryItem) => void
}

export default function LibraryContent({ categories, onOpenItem }: LibraryContentProps) {
  const [mode, setMode] = useState<ThuVienXanhMode>('doc-hieu')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const onModeChange = (nextMode: ThuVienXanhMode) => setMode(nextMode)

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => (mode === 'doc-hieu' ? item.hasDocHieu : item.hasTichHop)),
    }))
    .filter((category) => category.items.length > 0)

  const isEmpty = filteredCategories.length === 0

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wide text-blue-950">
          THƯ VIỆN KHOA HỌC VIỄN TƯỞNG
        </h1>

        <div className="inline-flex bg-white rounded-full p-1 border border-cyan-300 self-start">
          <button
            onClick={() => onModeChange('doc-hieu')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
              mode === 'doc-hieu' ? 'bg-teal-600 text-white' : 'text-slate-700'
            }`}
          >
            Đọc hiểu
          </button>
          <button
            onClick={() => onModeChange('tich-hop')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
              mode === 'tich-hop' ? 'bg-teal-600 text-white' : 'text-slate-700'
            }`}
          >
            Tích hợp
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="mt-10 rounded-2xl bg-white p-8 text-center text-slate-600 border border-cyan-200">
          Không có văn bản phù hợp với từ khóa tìm kiếm.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const isExpanded = !!expandedCategories[category.id]
            const hasMoreThanTen = category.items.length > 10
            const visibleItems = isExpanded ? category.items : category.items.slice(0, 10)

            return (
              <article key={category.id} className="rounded-3xl bg-white/90 border border-cyan-200 p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">{category.title}</h2>
                <ul className="mt-4 space-y-3">
                  {visibleItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onOpenItem(item)}
                      className="w-full text-left rounded-2xl bg-cyan-50 hover:bg-cyan-100 px-4 py-3 font-semibold text-slate-800 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span>{item.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.hasDocHieu && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Đọc hiểu
                            </span>
                          )}
                          {item.hasTichHop && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                              Tích hợp
                            </span>
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
      )}
    </section>
  )
}
