import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

// Pages
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentClassDetail from './pages/student/StudentClassDetail'
import AssignmentDetail from './pages/student/AssignmentDetail'
import ProductsPage from './pages/student/ProductsPage'
import ProfilePage from './pages/student/ProfilePage'
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
import HocLieuTextPage from './pages/thu-vien-xanh/HocLieuTextPage'
import { HiepSiXanhPage, SuGiaHoaBinhPage } from './pages/cong-dong'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isThuVienXanh = location.pathname.startsWith('/thu-vien-xanh')
  const isHomePage = location.pathname === '/trang-chu'
  const isCongDong = location.pathname.startsWith('/cong-dong')
  const isAuthPage = location.pathname === '/dang-nhap' || location.pathname === '/dang-ky'

  return (
    <div className={isThuVienXanh ? 'min-h-screen' : 'min-h-screen bg-gray-50'}>
      {!isThuVienXanh && !isHomePage && !isCongDong && !isAuthPage && <Header />}
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/trang-chu" replace />} />

            {/* Public routes */}
            <Route path="/trang-chu" element={<HomePage />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/thu-vien-xanh" element={<ThuVienXanhLibraryPage />} />
            <Route path="/thu-vien-xanh/hoc-lieu" element={<HocLieuTextPage />} />
            <Route path="/thu-vien-xanh/doc-hieu" element={<DocHieuFullscreenModal />} />
            <Route path="/thu-vien-xanh/tich-hop" element={<TichHopFullscreenModal />} />
            {/* Cong Dong Trac Nhiem routes */}
            <Route path="/cong-dong/hiep-si-xanh" element={<HiepSiXanhPage />} />
            <Route path="/cong-dong/su-gia-hoa-binh" element={<SuGiaHoaBinhPage />} />

            {/* Student routes */}
            <Route
              path="/hoc-sinh/trang-chu"
              element={
                <ProtectedRoute role="STUDENT">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hoc-sinh/lop-hoc/:classId"
              element={
                <ProtectedRoute role="STUDENT">
                  <StudentClassDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hoc-sinh/lop-hoc/:classId/bai-tap/:assignmentId"
              element={
                <ProtectedRoute role="STUDENT">
                  <AssignmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hoc-sinh/san-pham"
              element={
                <ProtectedRoute role="STUDENT">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hoc-sinh/ho-so"
              element={
                <ProtectedRoute role="STUDENT">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hoc-sinh/bai-nop"
              element={
                <ProtectedRoute role="STUDENT">
                  <Submissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hoc-sinh/thong-bao"
              element={
                <ProtectedRoute role="STUDENT">
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/giao-vien"
              element={
                <ProtectedRoute role="TEACHER">
                  <Navigate to="/giao-vien/trang-chu" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/giao-vien/trang-chu"
              element={
                <ProtectedRoute role="TEACHER">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/giao-vien/lop-hoc/:classId"
              element={
                <ProtectedRoute role="TEACHER">
                  <TeacherClassDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/giao-vien/tao-bai-tap/:classId"
              element={
                <ProtectedRoute role="TEACHER">
                  <CreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/giao-vien/xem-bai/:submissionId"
              element={
                <ProtectedRoute role="TEACHER">
                  <ReviewSubmission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/giao-vien/thong-bao"
              element={
                <ProtectedRoute role="TEACHER">
                  <TeacherNotifications />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/trang-chu" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}
