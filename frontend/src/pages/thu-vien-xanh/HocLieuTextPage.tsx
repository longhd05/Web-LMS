import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopNavBar from '../../components/thu-vien-xanh/TopNavBar'

const thuVienXanhBackground = new URL('../../img/1x/hinh-nen.png', import.meta.url).href
const hoaBinhSvg = new URL('../../../Cái liên hợp quốc - vào thư viện.svg', import.meta.url).href
const moiTruongSvg = new URL('../../../Liên hợp quốc - Vào thư viện.svg', import.meta.url).href

type HocLieuDocKey = 'lqh-hoa-binh' | 'lqh-moi-truong'

const hocLieuDocMap: Record<HocLieuDocKey, { title: string; imageUrl: string }> = {
  'lqh-hoa-binh': {
    title: 'Thông điệp từ LHQ về hoà bình',
    imageUrl: hoaBinhSvg,
  },
  'lqh-moi-truong': {
    title: 'Thông điệp từ LHQ về môi trường',
    imageUrl: moiTruongSvg,
  },
}

export default function HocLieuTextPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const selectedDoc = useMemo(() => {
    const docKey = searchParams.get('doc') as HocLieuDocKey | null
    if (!docKey || !hocLieuDocMap[docKey]) {
      return null
    }
    return hocLieuDocMap[docKey]
  }, [searchParams])

  return (
    <div
      className="min-h-screen bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
    >
      <TopNavBar searchValue="" onSearchChange={() => undefined} onSearchSubmit={() => undefined} />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate('/thu-vien-xanh')}
            className="inline-flex items-center rounded-full border border-cyan-300 bg-white/90 px-4 py-2 text-sm font-bold text-blue-900 hover:bg-cyan-50"
          >
            Quay lại thư viện
          </button>
        </div>

        {!selectedDoc ? (
          <div className="rounded-2xl border border-cyan-200 bg-white p-6 text-slate-700">Không tìm thấy văn bản học liệu.</div>
        ) : (
          <article className="rounded-3xl border border-cyan-200 bg-white/90 p-4 sm:p-6 lg:p-8 shadow-sm">
            <h1 className="text-center text-xl sm:text-2xl font-extrabold text-blue-950">{selectedDoc.title}</h1>

            <div className="mt-5 rounded-2xl border border-cyan-100 bg-white p-2">
              <img src={selectedDoc.imageUrl} alt={selectedDoc.title} className="w-full h-auto rounded-xl" />
            </div>
          </article>
        )}
      </section>
    </div>
  )
}
