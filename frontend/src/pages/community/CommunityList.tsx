import { Link } from 'react-router-dom'

const communities = [
  {
    key: 'hieu-si-xanh',
    name: 'Hiệp sĩ xanh',
    emoji: '🛡️',
    description: 'Cộng đồng dành cho những học sinh có tinh thần bảo vệ môi trường và phát triển bền vững.',
    color: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  {
    key: 'su-gia-hoa-binh',
    name: 'Sứ giả hòa bình',
    emoji: '☮️',
    description: 'Nơi chia sẻ những bài viết về hòa bình, tình hữu nghị và sự hợp tác quốc tế.',
    color: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'an-toan-cong-nghe',
    name: 'An toàn công nghệ',
    emoji: '🔐',
    description: 'Cộng đồng về an ninh mạng, sử dụng công nghệ an toàn và bảo vệ thông tin cá nhân.',
    color: 'from-purple-50 to-violet-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
]

export default function CommunityList() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Cộng đồng học tập</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Khám phá các bài viết xuất sắc từ học sinh trong ba cộng đồng học tập đặc biệt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {communities.map((c) => (
          <div
            key={c.key}
            className={`bg-gradient-to-br ${c.color} rounded-2xl border ${c.border} p-8 flex flex-col`}
          >
            <div className="text-5xl mb-5">{c.emoji}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{c.name}</h2>
            <p className="text-gray-600 mb-6 flex-1">{c.description}</p>
            <Link
              to={`/community/${c.key}`}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium ${c.badge} hover:opacity-80 transition-opacity`}
            >
              Xem bài viết
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
