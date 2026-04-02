# Web-LMS

Hệ thống quản lý học tập (Learning Management System) dành cho giáo viên và học sinh, hỗ trợ toàn bộ quy trình từ quản lý lớp học, bài tập, nộp bài đến chấm điểm và chia sẻ cộng đồng.

---

## Tính năng chính

| Đối tượng | Tính năng |
|-----------|-----------|
| **Chung** | Đăng ký / Đăng nhập (JWT), xem thông báo, cập nhật hồ sơ |
| **Học sinh** | Tham gia lớp học, xem & nộp bài tập (đọc hiểu + tích hợp), theo dõi kết quả, xem sản phẩm, đọc bài cộng đồng |
| **Giáo viên** | Tạo & quản lý lớp học, tạo bài tập từ thư viện, chấm bài nộp, publish bài lên cộng đồng |
| **Thư viện xanh** | Kho tài liệu học tập (đọc hiểu & tích hợp) phân theo cấp độ và thẻ tag, giao diện fullscreen |
| **Cộng đồng trách nhiệm** | Hai kênh cộng đồng: Hiệp sĩ xanh & Sứ giả hòa bình — chia sẻ bài nộp xuất sắc |
| **File** | Upload / download file bài nộp tích hợp |

---

## Tech Stack

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| [React](https://react.dev/) | 18 | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Vite](https://vitejs.dev/) | 5 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Utility-first styling |
| [React Router](https://reactrouter.com/) | 6 | Client-side routing |
| [Axios](https://axios-http.com/) | 1 | HTTP client |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Hiệu ứng animation |
| [Lucide React](https://lucide.dev/) | 0.5+ | Icon library |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| [Node.js](https://nodejs.org/) | ≥ 18 | Runtime |
| [Express](https://expressjs.com/) | 4 | Web framework |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Prisma](https://www.prisma.io/) | 5 | ORM |
| [SQLite](https://www.sqlite.org/) | - | Database |
| [JWT](https://jwt.io/) (`jsonwebtoken`) | 9 | Xác thực |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2 | Hash mật khẩu |
| [Zod](https://zod.dev/) | 3 | Validate dữ liệu đầu vào |
| [Multer](https://github.com/expressjs/multer) | 2 | Upload file |
| [Helmet](https://helmetjs.github.io/) | 7 | HTTP security headers |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | 7 | Rate limiting |

---

## Cấu trúc thư mục

```
Web-LMS/
├── backend/                  # Express + Prisma API server
│   ├── prisma/               # Schema & seed database
│   ├── src/
│   │   ├── routes/           # auth, classes, assignments, submissions, library, community, notifications, files
│   │   ├── middleware/       # JWT auth, RBAC
│   │   ├── lib/              # prisma client, config, constants, notifications helper
│   │   └── index.ts          # Entry point (port 3000)
│   └── uploads/              # Thư mục lưu file upload
└── frontend/                 # React + Vite SPA
    └── src/
        ├── pages/
        │   ├── student/      # StudentDashboard, StudentClassDetail, AssignmentDetail, ...
        │   ├── teacher/      # TeacherDashboard, TeacherClassDetail, CreateAssignment, ...
        │   ├── thu-vien-xanh/  # ThuVienXanhLibraryPage, DocHieuFullscreenModal, TichHopFullscreenModal
        │   ├── cong-dong/    # HiepSiXanhPage, SuGiaHoaBinhPage
        │   └── library/      # LibraryList, LibraryDetail
        ├── components/
        │   ├── student/      # Layout (StudentTopNavBar, StudentLayout, ...), Common, Assignment, Class
        │   ├── thu-vien-xanh/  # TopNavBar, LibraryContent, DocHieuBody, TichHopBody, ...
        │   └── library/      # IntegratedTaskModal, ReadingComprehensionModal
        ├── api/              # axios instance, thuVienXanhLibrary, integratedTask, readingComprehension
        ├── hooks/            # useThuVienXanhLibrary, useIntegratedTask, useReadingComprehension
        ├── contexts/         # AuthContext
        ├── types/            # TypeScript type definitions
        ├── data/             # Mock/static data
        └── utils/            # stringHelper và các helper khác
```

---

## Đường dẫn (Routes) Frontend

### Public
| Đường dẫn | Trang |
|-----------|-------|
| `/` | Tự động chuyển sang `/trang-chu` |
| `/trang-chu` | Trang chủ |
| `/dang-nhap` | Đăng nhập |
| `/dang-ky` | Đăng ký |
| `/thu-vien-xanh` | Thư viện xanh |
| `/thu-vien-xanh/doc-hieu` | Đọc hiểu fullscreen |
| `/thu-vien-xanh/tich-hop` | Tích hợp fullscreen |
| `/cong-dong/hiep-si-xanh` | Cộng đồng – Hiệp sĩ xanh |
| `/cong-dong/su-gia-hoa-binh` | Cộng đồng – Sứ giả hòa bình |
| `*` (catch-all) | Tự động chuyển về `/trang-chu` |

### Học sinh (yêu cầu đăng nhập với role `STUDENT`)
| Đường dẫn | Trang |
|-----------|-------|
| `/hoc-sinh/trang-chu` | Dashboard học sinh |
| `/hoc-sinh/lop-hoc/:classId` | Chi tiết lớp học |
| `/hoc-sinh/lop-hoc/:classId/bai-tap/:assignmentId` | Chi tiết bài tập |
| `/hoc-sinh/san-pham` | Sản phẩm |
| `/hoc-sinh/ho-so` | Hồ sơ |
| `/hoc-sinh/bai-nop` | Bài nộp |
| `/hoc-sinh/thong-bao` | Thông báo |

### Giáo viên (yêu cầu đăng nhập với role `TEACHER`)
| Đường dẫn | Trang |
|-----------|-------|
| `/giao-vien/trang-chu` | Dashboard giáo viên |
| `/giao-vien/lop-hoc/:classId` | Chi tiết lớp học |
| `/giao-vien/tao-bai-tap/:classId` | Tạo bài tập |
| `/giao-vien/xem-bai/:submissionId` | Chấm bài nộp |
| `/giao-vien/thong-bao` | Thông báo |

---

## Cài đặt & Chạy

### Yêu cầu
- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone repository

```bash
git clone https://github.com/duylonggg/Web-LMS.git
cd Web-LMS
```

### 2. Cài đặt & chạy Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_here"
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Khởi tạo database và chạy seed (dữ liệu mẫu):

```bash
npm run db:migrate   # Chạy migration tạo bảng
npm run db:seed      # Thêm dữ liệu mẫu (tuỳ chọn)
```

### ⚠️ Cập nhật database local khi có thay đổi từ Dev khác

Mỗi khi một thành viên trong nhóm push thay đổi liên quan đến database (schema hoặc dữ liệu seed), các thành viên còn lại cần **thực hiện các bước sau** để đồng bộ:

**1. Pull code mới nhất:**
```bash
git pull
```

**2. Kiểm tra xem có thay đổi schema không** (`backend/prisma/schema.prisma`).  
Nếu có → chạy migration:
```bash
cd backend
npm run db:migrate
```

**3. Kiểm tra xem có thay đổi seed không** (`backend/prisma/seed.ts`).  
Nếu có → chạy lại seed:
```bash
cd backend
npm run db:seed
```

> **Lưu ý:** Nếu cấu trúc database thay đổi lớn (xóa bảng, đổi tên cột…) và cần reset sạch:
> ```bash
> cd backend
> npm run db:reset   # Xóa toàn bộ dữ liệu, chạy lại migration + seed
> ```
> ⚠️ Lệnh này **xóa toàn bộ dữ liệu** trong database local, chỉ dùng khi cần thiết.

**Tóm tắt nhanh – quy trình làm việc nhóm:**
| Tình huống | Lệnh cần chạy |
|------------|---------------|
| Dev khác thay đổi `schema.prisma` | `npm run db:migrate` |
| Dev khác thay đổi `seed.ts` | `npm run db:seed` |
| Cả hai thay đổi | `npm run db:migrate` rồi `npm run db:seed` |
| Database bị lỗi / cần làm mới hoàn toàn | `npm run db:reset` |

Khởi động server (development):

```bash
npm run dev
```

Server chạy tại **http://localhost:3000**

### 3. Cài đặt & chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại **http://localhost:5173**

### 4. Build production

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
# Output tại frontend/dist/
```

---

## API chính

> **Rate limiting:** Tất cả các API bị giới hạn **200 request / 15 phút / IP**. Riêng `/auth/login` giới hạn thêm **10 lần đăng nhập / 15 phút / IP**.

### Xác thực
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/register` | — | Đăng ký tài khoản (`STUDENT` / `TEACHER`) |
| POST | `/auth/login` | — | Đăng nhập, trả về `accessToken` |
| POST | `/auth/logout` | — | Đăng xuất |
| GET | `/auth/me` | ✅ | Thông tin người dùng hiện tại |
| PUT | `/auth/profile` | ✅ | Cập nhật tên / avatar |
| GET | `/me` | ✅ | Alias thông tin người dùng hiện tại |

### Lớp học
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/classes` | ✅ | Danh sách lớp học của người dùng |
| POST | `/classes` | ✅ Teacher | Tạo lớp học mới |
| POST | `/classes/join` | ✅ Student | Tham gia lớp bằng mã |
| GET | `/classes/:classId` | ✅ | Chi tiết lớp (kèm danh sách bài tập & thành viên) |
| GET | `/classes/:classId/assignments` | ✅ | Bài tập của lớp |
| GET | `/classes/:classId/submissions` | ✅ Teacher | Tất cả bài nộp của lớp |

### Bài tập
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/assignments` | ✅ Teacher | Tạo bài tập từ thư viện |
| GET | `/assignments/:id` | ✅ | Chi tiết bài tập |
| DELETE | `/assignments/:id` | ✅ Teacher | Xóa bài tập |

### Bài nộp
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/assignments/:assignmentId/submissions` | ✅ Student | Nộp bài (tạo hoặc cập nhật) |
| GET | `/submissions` | ✅ | Danh sách bài nộp của học sinh hiện tại |
| GET | `/submissions/:id` | ✅ | Chi tiết bài nộp |
| POST | `/submissions/:id/review` | ✅ Teacher | Chấm bài nộp |
| POST | `/submissions/:id/publish` | ✅ Teacher | Publish bài lên cộng đồng |

### Thư viện
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/library` | — | Danh sách tài liệu (hỗ trợ `search`, `page`, `limit`, `type`) |

### Cộng đồng
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/community/:communityKey/posts` | — | Danh sách bài đăng theo kênh |
| GET | `/community/:communityKey/posts/:postId` | — | Chi tiết bài đăng |

### File & Khác
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/files` | ✅ | Upload file bài nộp |
| GET | `/notifications` | ✅ | Danh sách thông báo |
| POST | `/notifications/read` | ✅ | Đánh dấu đã đọc |
| GET | `/uploads/:filename` | — | Truy cập file đã upload |
| GET | `/health` | — | Health check |