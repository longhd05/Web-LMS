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
| [MySQL](https://www.mysql.com/) | 8 | Database |
| [JWT](https://jwt.io/) (`jsonwebtoken`) | 9 | Xác thực |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2 | Hash mật khẩu |
| [Zod](https://zod.dev/) | 3 | Validate dữ liệu đầu vào |
| [Multer](https://github.com/expressjs/multer) | 2 | Upload file |
| [Helmet](https://helmetjs.github.io/) | 7 | HTTP security headers |

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

## Cài đặt & Chạy bằng Docker (Frontend + Backend + MySQL)

### Yêu cầu
- **Docker**
- **Docker Compose**

### 1. Clone repository

```bash
git clone https://github.com/duylonggg/Web-LMS.git
cd Web-LMS
```

### 2. Chạy toàn bộ hệ thống

Tạo file biến môi trường Docker:

```bash
cp .env.docker.example .env
```

Sau đó chạy:

```bash
docker compose up --build -d
```

Sau khi chạy:
- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:3000**
- MySQL: **localhost:3306** (db: lấy từ `MYSQL_DATABASE`)

### 3. Dừng hệ thống

```bash
docker compose down
```

### 4. Xóa luôn dữ liệu database (nếu cần reset sạch)

```bash
docker compose down -v
```

### 5. Tùy chỉnh cấu hình môi trường (tuỳ chọn)

Trong `docker-compose.yml`, bạn có thể đổi:
- các giá trị trong file `.env` (được copy từ `.env.docker.example`):
  - `JWT_SECRET`
  - thông tin MySQL (`MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`)
  - `CORS_ORIGIN`

> Service `backend-init` sẽ chạy `npm run db:push` (Prisma `db push`) và `npm run db:seed` một lần trước khi backend khởi động.

### 6. Ubuntu 24.04 – xử lý lỗi MySQL `unhealthy`

Nếu bạn gặp lỗi như:
- `OS errno 28 - No space left on device`
- `--initialize specified but the data directory has files in it`
- `container ... mysql ... is unhealthy`

Bản compose đã thêm preflight script để:
- phát hiện datadir MySQL bị khởi tạo dở và tự dọn file lỗi,
- báo lỗi rõ ràng khi volume Docker không ghi được.

Quy trình khuyến nghị trên Ubuntu 24.04:

```bash
df -h
docker compose down -v
docker system prune -f
docker compose up --build -d
```

Nếu muốn tắt cơ chế tự dọn datadir khởi tạo dở, set biến môi trường:

```bash
MYSQL_AUTO_CLEAN_PARTIAL_INIT=0
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
