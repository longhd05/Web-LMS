# Web-LMS

Hệ thống quản lý học tập (Learning Management System) dành cho giáo viên và học sinh, hỗ trợ toàn bộ quy trình từ quản lý lớp học, bài tập, nộp bài đến chấm điểm và chia sẻ cộng đồng.

---

## Tính năng chính

| Đối tượng | Tính năng |
|-----------|-----------|
| **Chung** | Đăng ký / Đăng nhập (JWT), xem thông báo |
| **Học sinh** | Tham gia lớp học, xem & nộp bài tập, theo dõi kết quả, xem thư viện tài liệu, đọc bài cộng đồng |
| **Giáo viên** | Tạo & quản lý lớp học, tạo bài tập từ thư viện, chấm bài nộp, publish bài lên cộng đồng |
| **Thư viện** | Kho tài liệu học tập phân theo cấp độ và thẻ tag |
| **Cộng đồng** | Chia sẻ bài nộp xuất sắc để học sinh khác tham khảo |
| **File** | Upload / download file bài nộp |

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

---

## Cấu trúc thư mục

```
Web-LMS/
├── backend/          # Express + Prisma API server
│   ├── prisma/       # Schema & seed database
│   ├── src/
│   │   ├── routes/   # auth, classes, assignments, submissions, library, community, notifications, files
│   │   ├── middleware/  # JWT auth, RBAC
│   │   └── index.ts  # Entry point (port 3000)
│   └── uploads/      # Thư mục lưu file upload
└── frontend/         # React + Vite SPA
    └── src/
        ├── pages/    # Landing, Login, Register, Student, Teacher, Library, Community
        ├── components/
        ├── api/
        └── contexts/
```

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

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập |
| GET | `/me` | Thông tin người dùng hiện tại |
| GET/POST | `/classes` | Danh sách / tạo lớp học |
| GET/POST | `/assignments` | Bài tập |
| POST | `/assignments/:id/submissions` | Nộp bài |
| GET | `/library` | Thư viện tài liệu |
| GET | `/community` | Bài cộng đồng |
| GET | `/notifications` | Thông báo |
| GET | `/health` | Health check |