import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import LibraryList from './pages/library/LibraryList'
import LibraryDetail from './pages/library/LibraryDetail'
import CommunityList from './pages/community/CommunityList'
import CommunityDetail from './pages/community/CommunityDetail'
import StudentDashboard from './pages/student/StudentDashboard'
import ClassDetail from './pages/student/ClassDetail'
import Submissions from './pages/student/Submissions'
import Notifications from './pages/student/Notifications'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClassDetail from './pages/teacher/TeacherClassDetail'
import CreateAssignment from './pages/teacher/CreateAssignment'
import ReviewSubmission from './pages/teacher/ReviewSubmission'
import TeacherNotifications from './pages/teacher/TeacherNotifications'
import ThuVienXanhLibraryPage from './pages/thu-vien-xanh/ThuVienXanhLibraryPage'
import DocHieuFullscreenModal from './pages/thu-vien-xanh/DocHieuFullscreenModal'
import TichHopFullscreenModal from './pages/thu-vien-xanh/TichHopFullscreenModal'
import { CongDongTrachNhiemPage, HiepSiXanhPage, SuGiaHoaBinhPage } from './pages/cong-dong'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isThuVienXanh = location.pathname.startsWith('/thu-vien-xanh')
  const isHomePage = location.pathname === '/trang-chu'

  return (
    <div className={isThuVienXanh ? 'min-h-screen' : 'min-h-screen bg-gray-50'}>
      {!isThuVienXanh && !isHomePage && <Header />}
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/trang-chu" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/library" element={<LibraryList />} />
            <Route path="/library/:id" element={<LibraryDetail />} />
            <Route path="/thu-vien-xanh" element={<ThuVienXanhLibraryPage />} />
            <Route path="/thu-vien-xanh/doc-hieu" element={<DocHieuFullscreenModal />} />
            <Route path="/thu-vien-xanh/tich-hop" element={<TichHopFullscreenModal />} />
            <Route path="/library/:id" element={<LibraryDetail />} />
            <Route path="/community" element={<CommunityList />} />
            <Route path="/community/:communityKey" element={<CommunityDetail />} />

            {/* Cong Dong Trac Nhiem routes */}
            <Route path="/cong-dong" element={<CongDongTrachNhiemPage />} />
            <Route path="/cong-dong/hiep-si-xanh" element={<HiepSiXanhPage />} />
            <Route path="/cong-dong/su-gia-hoa-binh" element={<SuGiaHoaBinhPage />} />

            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="STUDENT">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/class/:classId"
              element={
                <ProtectedRoute role="STUDENT">
                  <ClassDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/submissions"
              element={
                <ProtectedRoute role="STUDENT">
                  <Submissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute role="STUDENT">
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute role="TEACHER">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/class/:classId"
              element={
                <ProtectedRoute role="TEACHER">
                  <TeacherClassDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/create-assignment/:classId"
              element={
                <ProtectedRoute role="TEACHER">
                  <CreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/review/:submissionId"
              element={
                <ProtectedRoute role="TEACHER">
                  <ReviewSubmission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/notifications"
              element={
                <ProtectedRoute role="TEACHER">
                  <TeacherNotifications />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                  <p className="text-6xl font-bold text-gray-200">404</p>
                  <p className="text-xl text-gray-600">Trang không tồn tại</p>
                  <a href="/" className="text-green-600 hover:underline font-medium">← Về trang chủ</a>
                </div>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}
