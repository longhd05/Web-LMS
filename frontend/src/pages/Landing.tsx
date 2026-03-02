import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span>🌿</span>
          <span>Nền tảng học tập trực tuyến</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Viễn Tưởng{' '}
          <span className="text-green-600">Xanh</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Khám phá kho tàng học liệu phong phú, tham gia lớp học trực tuyến và chia sẻ kiến thức
          với cộng đồng học sinh trên toàn quốc.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/library"
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
          >
            Khám phá Thư viện
          </Link>
          {!user ? (
            <Link
              to="/login"
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              Đăng nhập
            </Link>
          ) : user.role === 'STUDENT' ? (
            <Link
              to="/student/dashboard"
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              Vào lớp học
            </Link>
          ) : (
            <Link
              to="/teacher/dashboard"
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              Quản lý lớp học
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📚"
            title="Thư viện học liệu"
            description="Kho tài liệu đa dạng với các bài đọc hiểu và bài tích hợp theo nhiều chủ đề và cấp độ khác nhau."
            link="/library"
            linkText="Xem thư viện"
          />
          <FeatureCard
            icon="🏫"
            title="Lớp học trực tuyến"
            description="Giáo viên tạo lớp, giao bài tập và chấm điểm. Học sinh tham gia và nộp bài thuận tiện."
            link={user ? (user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard') : '/login'}
            linkText="Vào lớp học"
          />
          <FeatureCard
            icon="🌐"
            title="Cộng đồng học tập"
            description="Chia sẻ và xem bài làm xuất sắc từ các học sinh trong ba cộng đồng học tập đặc biệt."
            link="/community"
            linkText="Khám phá cộng đồng"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-600 py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-green-100">Tài liệu học tập</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-green-100">Học sinh tham gia</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">3</div>
              <div className="text-green-100">Cộng đồng học tập</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon, title, description, link, linkText,
}: {
  icon: string
  title: string
  description: string
  link: string
  linkText: string
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <Link to={link} className="text-green-600 font-medium hover:text-green-700 inline-flex items-center gap-1">
        {linkText}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
