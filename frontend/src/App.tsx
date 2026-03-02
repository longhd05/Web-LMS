import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/library" element={<LibraryList />} />
            <Route path="/library/:id" element={<LibraryDetail />} />
            <Route path="/community" element={<CommunityList />} />
            <Route path="/community/:communityKey" element={<CommunityDetail />} />

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
