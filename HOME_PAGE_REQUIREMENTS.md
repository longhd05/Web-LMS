# YÊU CẦU THIẾT KẾ TRANG CHỦ - THẾ GIỚI KHOA HỌC VIỄN TƯỞNG

## 📋 MÔ TÃ TỔNG QUAN
Trang chủ (Home page) là một React TypeScript component sử dụng Tailwind CSS và Anime.js với thiết kế tông màu xanh dương gradient, tạo trải nghiệm người dùng mượt mà và hiện đại cho nền tảng học tập "Viễn Tưởng Xanh".

---

## 🛠️ 1. CÀI ĐẶT CHUNG & TÀI NGUYÊN

### Stack công nghệ hiện có
- **React**: 18.3.1 + TypeScript 5.4.5
- **React Router DOM**: 6.23.1 (cho navigation)
- **Vite**: 5.2.13 (build tool)
- **Tailwind CSS**: 3.4.4 (đã được cài đặt)
- **Axios**: 1.6.8 (cho API calls)
- **lucide-react**: 0.576.0 (cho icons)

### Cần cài đặt thêm
- **Anime.js**: ~3.2.1 (cho animation)

### Cài đặt Anime.js
```bash
npm install animejs
# hoặc
yarn add animejs
```

**Lưu ý về icons:**
- lucide-react đã có sẵn: `import { Shield, Menu, ChevronDown } from 'lucide-react'`
- Có thể cần thêm icon chim/bird (hoặc dùng emoji)

### Tài nguyên hình ảnh
**Tất cả 6 file ảnh CẦN THIẾT:**
- `hinh-nen-giao-dien-chinh.png` - Background trang chủ (gradient xanh)
- `logo-thu-vien.png` - Logo header (hình tròn)
- `home-details.png` - Sơ đồ hexagon truyện khoa học viễn tưởng
- `home-ton-trong.png` - Hình minh họa phần Tôn trọng (hoặc các badges)
- `home-su-gia-hoa-binh.png` - Card Sứ Giả Hòa Bình & Hòa Giải
- `home-hiep-si-xanh.png` - Card Hiệp Sĩ Xanh

### Import và sử dụng trong React
```typescript
import bgImage from '../img/hinh-nen-giao-dien-chinh.png'
import logoImage from '../img/logo-thu-vien.png'
// ... other imports

// Trong JSX:
<div style={{ backgroundImage: `url(${bgImage})` }} className="bg-cover bg-center bg-fixed">
  {/* content */}
</div>
```

---

## 🎨 2. CẤU TRÚC LAYOUT (Top to Bottom)

### A. HEADER - Thanh điều hướng
- Tạo custom header riêng với thiết kế mới

**Thuộc tính:**
- Position: `fixed top-0`
- Width: `w-full`
- Z-index: `z-50`
- Backdrop: `backdrop-blur-md` hoặc nền bán trong suốt
- Layout: `flex justify-between items-center px-8 py-4`

**Cấu trúc:**
```
┌─────────────────────────────────────────────────────────────┐
│  THẾ GIỚI KHOA HỌC      [LOGO]      ĐĂNG NHẬP │ ĐĂNG KÝ │☰ │
│  VIỄN TƯỞNG                                                  │
└─────────────────────────────────────────────────────────────┘
```

**Các thành phần:**
1. **Bên trái**: Text "THẾ GIỚI KHOA HỌC VIỄN TƯỞNG"
2. **Ở giữa**: `<img src={logoImage} alt="Logo" />`
3. **Bên phải**: 
   - `<Link to="/login">ĐĂNG NHẬP</Link>` (từ react-router-dom)
   - `<Link to="/register">ĐĂNG KÝ</Link>`
   - Icon Hamburger từ lucide-react: `<Menu className="w-6 h-6" />`

**Tích hợp với AuthContext:**
```typescript
import { useAuth } from '../contexts/AuthContext'

const { user } = useAuth()

// Hiển thị tên user hoặc nút login/register tùy vào trạng thái
{!user ? (
  <Link to="/login">ĐĂNG NHẬP</Link>
) : (
  <span>{user.name}</span>
)}
```

---

### B. SECTION 1 - Hero Banner
**Thuộc tính:**
- Height: `min-h-screen`
- Layout: `flex flex-col justify-center items-center`
- Text alignment: `text-center`
- Background: Gradient xanh dương/cyan

**Nội dung:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              VIỄN TƯỞNG XANH                       │
│           (Tiêu đề rất lớn, màu xanh đậm)          │
│                                                     │
│  Bằng cách đọc tác phẩm văn học, chúng ta có thể  │
│  học hỏi và thực hành cập nhật hành trạm đồng,    │
│  tự tin hiểu và thực hành quy trình năng động,    │
│  tối đa hóa cách sống của bản thân, người khác    │
│  và môi trường.                                    │
│                                                     │
│                    ⏬⏬                              │
│          Cuộn xuống để tiếp tục đọc               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Chi tiết:**
1. **Tiêu đề chính**: "VIỄN TƯỞNG XANH"
   - Font size: text-6xl hoặc text-7xl
   - Font weight: font-extrabold
   - Color: text-blue-900 hoặc text-blue-800
   - Effect: text-shadow với glow xanh (optional)
   
2. **Mô tả**: Đoạn văn bản dài (hiển thị đầy đủ)
   ```
   "Bằng cách đọc tác phẩm văn học, chúng ta có thể học hỏi và thực hành 
   cập nhật hành trạm đồng, tự tin hiểu và thực hành quy trình năng động, 
   tối đa hóa cách sống của bản thân, người khác và môi trường."
   ```
   - Max-width: max-w-3xl
   - Text size: text-lg hoặc text-xl
   - Color: text-gray-700
   
3. **Scroll indicator**: 
   - Icon: Double `<ChevronDown />` (2 chevron chồng lên nhau)
   - Class: `scroll-arrow` (cho animation)
   - Text: "Cuộn xuống để tiếp tục đọc"
   
```typescript
import { ChevronDown } from 'lucide-react'

<div className="scroll-arrow flex flex-col items-center gap-2">
  <div className="relative">
    <ChevronDown className="w-8 h-8 text-blue-600" />
    <ChevronDown className="w-8 h-8 text-blue-600 absolute top-3" />
  </div>
  <p className="text-blue-700 font-medium">Cuộn xuống để tiếp tục đọc</p>
</div>
```

**LƯU Ý**: Không có "subtitle card" riêng - mô tả là text thường nằm dưới tiêu đề

---

### C. SECTION 2 - Truyện Khoa Học Viễn Tưởng
**Thuộc tính:**
- Layout: Căn giữa
- Padding: `py-20`
- Background: Có thể sáng hơn section hero

**Nội dung:**
```
┌─────────────────────────────────────────────────┐
│        TRUYỆN KHOA HỌC VIỄN TƯỞNG              │
│                                                 │
│              ┌────────────┐                    │
│         ┌────┤ TRI THỨC   ├────┐              │
│    ┌────┤    │ THÀNH TỰU  │    ├────┐         │
│    │ Để │    │ KHOA HỌC   │    │Tưởng│        │
│    │lại │    └────────────┘    │tượng│        │
│    │gián│          +            │hư   │        │
│    └────┤    ┌────────────┐    ├────┘         │
│         └────┤  TƯỞNG     ├────┘              │
│              │  TƯỢNG     │                    │
│              │  HƯ CẤU    │                    │
│         ┌────┴────────────┴────┐              │
│    ┌────┤    TRUYỆN KHOA HỌC   ├────┐         │
│    │Nhắm│    VIỄN TƯỞNG         │Tinh│        │
│    │về  │                       │hưởng│        │
│    └────┤                       ├────┘         │
│         └────┬────────────┬────┘              │
│         ┌────┤  Bài nguồn ├────┐              │
│         │Cổi │  lợ sử việc│    │              │
│         └────┴────────────┴────┘              │
│                                                 │
│  (Sơ đồ hexagon với 6-7 node kết nối)         │
└─────────────────────────────────────────────────┘
```

**Chi tiết:**
- **Tiêu đề**: "TRUYỆN KHOA HỌC VIỄN TƯỞNG"
  - Font size: text-4xl md:text-5xl
  - Font weight: font-bold
  - Color: text-blue-900
  - Margin bottom: mb-12

- **Sơ đồ Hexagon**: Có thể dùng 1 trong 2 cách:
  
  **Dùng ảnh** (Đơn giản)
  ```typescript
  <img 
    src={homeDetailsImage} 
    className="mx-auto w-full max-w-4xl fade-scale opacity-0" 
    alt="Sơ đồ truyện khoa học viễn tưởng" 
  />
  ```

**KHUYẾN NGHỊ**: Dùng **Cách 1** (ảnh) cho đơn giản, đã có file `home-details.png`

---

### D. SECTION 3 - Giáo Dục Phát Triển Bền Vững
**Thuộc tính:**
- Background: Gradient chuyển từ xanh nhạt sang xanh tím (cyan → blue/purple)
- Padding: `py-20`

**Nội dung:**
```
┌──────────────────────────────────────────────┐
│     GIÁO DỤC PHÁT TRIỂN BỀN VỮNG            │
│                                              │
│            ┌──────────┐                     │
│            │TÔN TRỌNG │                     │
│            └──────────┘                     │
│                                              │
│   ┌────────────┐ ┌────────────┐ ┌────────┐│
│   │Tôn trọng   │ │Tôn trọng   │ │Tôn trọng││
│   │bản thân    │ │người khác  │ │sự đa dạng││
│   └────────────┘ └────────────┘ │văn hóa │││
│                                  └────────┘││
│                                              │
│        ╔════════════════════════╗           │
│        ║ CỘNG ĐỒNG TRÁCH NHIỆM  ║           │
│        ╚════════════════════════╝           │
│                                              │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │   🕊️            │  │    🛡️           │  │
│  │                 │  │                 │  │
│  │  SỨ GIẢ        │  │   HIỆP SĨ       │  │
│  │  HÒA BÌNH      │  │   XANH          │  │
│  │  & HÒA GIẢI    │  │                 │  │
│  │                 │  │                 │  │
│  │ (Màu xanh nhạt)│  │ (Màu xanh lá)   │  │
│  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────┘
```

**Chi tiết:**

1. **Tiêu đề**: "GIÁO DỤC PHÁT TRIỂN BỀN VỮNG"
   - Font size: text-4xl md:text-5xl
   - Font weight: font-bold
   - Color: text-blue-900 hoặc text-white (nếu background đậm)
   - Margin bottom: mb-8

2. **Hình "TÔN TRỌNG"** (có thể chứa badges hoặc illustration)
   ```typescript
   <img 
     src={homeTonTrongImage} 
     className="mx-auto mt-8 max-w-2xl fade-scale opacity-0" 
     alt="Tôn trọng" 
   />
   ```
   - Ảnh này có thể chứa: Badge "TÔN TRỌNG" + 3 sub-badges bên dưới
   - Hoặc là một illustration về tôn trọng

3. **Badge "CỘNG ĐỒNG TRÁCH NHIỆM"** (lớn, nổi bật)
   ```typescript
   <div className="inline-block px-8 py-3 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-full font-bold text-xl mb-12 shadow-lg mt-8">
     CỘNG ĐỒNG TRÁCH NHIỆM
   </div>
   ```

4. **2 Cards lớn** (Grid layout - SỬ DỤNG ẢNH)
   ```typescript
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
     {/* Card 1: Sứ Giả Hòa Bình - SỬ DỤNG ẢNH */}
     <img
       src={suGiaImage}
       onClick={() => navigate('/cong-dong/su-gia-hoa-binh')}
       className="card-hover fade-slide opacity-0 w-full rounded-3xl cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
       alt="Sứ Giả Hòa Bình & Hòa Giải"
     />

     {/* Card 2: Hiệp Sĩ Xanh - SỬ DỤNG ẢNH */}
     <img
       src={hiepSiImage}
       onClick={() => navigate('/cong-dong/hiep-si-xanh')}
       className="card-hover fade-slide opacity-0 w-full rounded-3xl cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
       alt="Hiệp Sĩ Xanh"
     />
   </div>
   ```

**LƯU Ý:**
- Tất cả 3 ảnh (`home-ton-trong.png`, `home-su-gia-hoa-binh.png`, `home-hiep-si-xanh.png`) đều được sử dụng
- Cards là các ảnh có thiết kế sẵn (icon + text + màu nền)
- Chỉ cần thêm hover effects và click navigation

**Navigation:**
```typescript
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
```

---

## ✨ 3. YÊU CẦU HIỆU ỨNG (ANIME.JS & JAVASCRIPT)

### A. Loop Animation - Scroll Arrow
```typescript
import anime from 'animejs'
import { useEffect } from 'react'

useEffect(() => {
  // Hiệu ứng nảy liên tục cho scroll indicator
  anime({
    targets: '.scroll-arrow',
    translateY: [0, 20],
    duration: 1500,
    easing: 'easeInOutQuad',
    loop: true,
    direction: 'alternate'
  })
}, [])
```

### B. Scroll Reveal Animation
Sử dụng IntersectionObserver + useRef để trigger animation khi scroll:

```typescript
import { useEffect, useRef } from 'react'
import anime from 'animejs'

const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px'
}

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger animation
        if (entry.target.classList.contains('fade-scale')) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 1000,
            easing: 'easeOutExpo'
          })
        } else if (entry.target.classList.contains('fade-slide')) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 1000,
            easing: 'easeOutExpo'
          })
        }
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe elements
  document.querySelectorAll('.fade-scale, .fade-slide').forEach(el => {
    observer.observe(el)
  })

  return () => observer.disconnect()
}, [])
```

**1. Ảnh `home-details.png` và `home-ton-trong.png`:**
- Effect: Fade in + Scale up
- Class: `fade-scale opacity-0`
- From: `opacity: 0, scale: 0.9`
- To: `opacity: 1, scale: 1`
- Apply cho: `<img src={homeDetailsImage} />` và `<img src={homeTonTrongImage} />`

**2. Hai card ảnh (`home-su-gia-hoa-binh.png`, `home-hiep-si-xanh.png`):**
- Effect: Fade in + Translate Y (trượt từ dưới lên)
- Class: `fade-slide opacity-0`
- From: `opacity: 0, translateY: 50px`
- To: `opacity: 1, translateY: 0`
- Apply cho: `<img src={suGiaImage} />` và `<img src={hiepSiImage} />`

### C. Hover Animation - Cards
Sử dụng Tailwind CSS classes:
```typescript
<img 
  className="card-hover w-full rounded-xl cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
  src={cardImage}
  alt="Card"
/>
```

Effect:
- Scale: 1 → 1.05
- TranslateY: 0 → -8px
- Shadow: lg → 2xl
- Duration: 300ms
- Smooth transition với `transition-all`

---

## 🎨 4. THIẾT KẾ MÀU SẮC VÀ HIỆU ỨNG

### Gradient xanh dương (based on existing Landing.tsx)
- **Tông màu chủ đạo**: Xanh lá + Xanh dương (Green + Blue/Indigo)
- **Background**: `bg-gradient-to-br from-green-50 to-indigo-50` (soft, existing pattern)
- **Hoặc**: `bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100` (xanh dương thuần)

**Sử dụng gradient trong:**
- Background sections: Soft gradients (50-100 shades)
- Tiêu đề: Darker colors (600-900)
- Buttons/Badges: `from-green-600 to-green-700` (existing) hoặc `from-blue-600 to-blue-700`
- Glow effects: Semi-transparent với opacity 0.4-0.6

### Text Effects
**Tiêu đề "VIỄN TƯỞNG XANH"**:
```typescript
<h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 [text-shadow:_0_0_20px_rgba(59,130,246,0.6)]">
  VIỄN TƯỞNG XANH
</h1>
```

**Hoặc thêm class trong index.css:**
```css
.hero-title {
  @apply text-6xl md:text-7xl font-extrabold;
  background: linear-gradient(to right, #2563eb, #06b6d4, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
}
```

### Màu sắc theo pattern hiện có (Landing.tsx)
- Primary green: `green-600`, `green-700` (buttons)
- Text: `gray-900` (headings), `gray-600/700` (body)
- Accents: `green-100` (badges), `green-50` (backgrounds)

**Để match với "Viễn Tưởng Xanh" brand:**
- Đổi green → blue/cyan trong các elements chính
- Giữ structure và spacing như hiện tại

### Shadows & Depth
```typescript
// Cards
className="shadow-lg hover:shadow-2xl transition-shadow duration-300"

// Buttons/Badges
className="shadow-lg shadow-blue-200"

// Hover elevation
className="hover:shadow-2xl hover:-translate-y-1"
```

---

## 📱 5. RESPONSIVE DESIGN
- Only desktop.

### Grid Cards
- Mobile: 1 column (`grid-cols-1`)
- Desktop: 2 columns (`md:grid-cols-2`)

---

## 🔗 6. CẤU TRÚC FILE

```
Web-LMS/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── HomePage.tsx ← File mới
│   │   ├── img/
│   │   │   ├── hinh-nen-giao-dien-chinh.png ← CẦN
│   │   │   ├── logo-thu-vien.png ← CẦN
│   │   │   ├── home-details.png ← CẦN (sơ đồ hexagon)
│   │   │   ├── home-ton-trong.png ← CẦN
│   │   │   ├── home-su-gia-hoa-binh.png ← CẦN
│   │   │   └── home-hiep-si-xanh.png ← CẦN
│   │   ├── App.tsx ← Cần thêm route mới
│   │   └── ...
│   └── package.json ← Cần thêm animejs
```

### Template Component cơ bản

```typescript
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import anime from 'animejs'
import { useAuth } from '../contexts/AuthContext'

// Import images
import bgImage from '../img/hinh-nen-giao-dien-chinh.png'
import logoImage from '../img/logo-thu-vien.png'
import homeDetailsImage from '../img/home-details.png'
import homeTonTrongImage from '../img/home-ton-trong.png'
import suGiaImage from '../img/home-su-gia-hoa-binh.png'
import hiepSiImage from '../img/home-hiep-si-xanh.png'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Scroll arrow animation
    anime({
      targets: '.scroll-arrow',
      translateY: [0, 20],
      duration: 1500,
      easing: 'easeInOutQuad',
      loop: true,
      direction: 'alternate'
    })

    // Scroll reveal observer
    const observer = new IntersectionObserver((entries) => {
      // ... animation logic
    }, { threshold: 0.2 })

    document.querySelectorAll('.fade-scale, .fade-slide').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Header */}
      {/* Hero Section */}
      {/* Section 2 */}
      {/* Section 3 */}
    </div>
  )
}
```

### Thêm route vào App.tsx

```typescript
import HomePage from './pages/HomePage'

// Trong <Routes>:
<Route path="/" element={<HomePage />} />
// hoặc
<Route path="/trang-chu" element={<HomePage />} />
```

---

## ❓ CÂU HỎI CẦN LÀM RÕ

Vui lòng trả lời các câu hỏi sau để hoàn thiện requirements:

### 1. Cấu trúc thư mục
**Q1.1:** Tên file React component?
- [x] `HomePage.tsx` (recommended)
- [ ] `Home.tsx`
- [ ] `ScienceFictionHome.tsx`
- [ ] Khác: `____________________`

**Trả lời:** HomePage.tsx

**Q1.2:** Route path cho trang này?
- [x] `/` (thay thế Landing.tsx hiện tại)
- [ ] `/trang-chu` (giữ Landing.tsx cho `/`)
- [ ] `/science-fiction-home`
- [ ] Khác: `____________________`

**Trả lời:** `/` (thay thế Landing.tsx hiện tại)

**Q1.3:** Các file ảnh sẽ được đặt ở đâu?
- [x] `frontend/src/img/1x` (recommended - có thể import trực tiếp)
- [ ] `frontend/public/assets/` (cần dùng đường dẫn tuyệt đối)
- [ ] Khác: `____________________`

**Trả lời:** frontend/src/img/1x

---

### 2. Header & Navigation

**Q2.1:** Sử dụng Header component nào?
- [ ] Sử dụng Header.tsx hiện có (đơn giản, nhất quán)
- [x] Tạo custom header mới theo thiết kế (theo yêu cầu)
- [ ] Không có header (fullscreen)

**Trả lời:** Tạo custom header mới theo thiết kế (theo yêu cầu)

**Q2.2:** Nếu tạo custom header - hiệu ứng transparent → solid khi cuộn?
- [x] Có - Ban đầu transparent, cuộn xuống thì có nền solid
- [ ] Không - Luôn có nền solid
- [ ] Không - Luôn transparent với backdrop-blur

**Trả lời:** Có - Ban đầu transparent, cuộn xuống thì có nền solid

**Q2.3:** Navigation links trong header?
- [x] Sử dụng React Router `<Link>` đến `/login`, `/register`
- [ ] Sử dụng AuthContext để hiển thị user name nếu đã login
- [ ] Thêm links đến `/library`, `/community`

**Trả lời:** Sử dụng Link và AuthContext

**Q2.4:** Icon Hamburger menu (từ lucide-react)?
- [ ] Chỉ hiển thị trên mobile, mở sidebar menu
- [x] Luôn hiển thị, mở dropdown menu
- [ ] Không cần (đơn giản hóa)

**Trả lời:** Luôn hiển thị, mở dropdown menu (sử dụng từ lucide-react)

---

### 3. Màu sắc & Typography

**Q3.1:** Gradient xanh dương cụ thể (Tailwind classes)?
- Ví dụ từ Landing.tsx hiện có: `bg-gradient-to-br from-green-50 to-indigo-50`
- Đề xuất cho trang này: `bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600` (cho elements nổi bật)
- Hoặc softer: `bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100` (cho background)

**Trả lời:** `bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600`

**Q3.2:** Font chữ sử dụng?
- [x] Font mặc định của Tailwind (Inter, system fonts) - đang dùng trong project
- [ ] Google Font khác: `____________________` (tên font)

**Trả lời:** Dùng font mặc định (Inter) để nhất quán

**Q3.3:** Màu glow effect cho tiêu đề "VIỄN TƯỞNG XANH"?
- Đề xuất: `text-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)`
- Hoặc dùng Tailwind plugin cho text-glow

**Trả lời:** `text-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)`

---

### 4. Animation & Interaction

**Q4.1:** Thời gian animation (duration) mong muốn?
- Fade in/Scale: `800ms` (đề xuất: 800-1200ms)
- Card hover: `300ms` (đề xuất: 300ms)

**Trả lời:** Fade in/Scale: `800ms` và Card hover: `300ms`

**Q4.2:** Các card ảnh khi click sẽ điều hướng đến đâu?
- [x] `/cong-dong/su-gia-hoa-binh` và `/cong-dong/hiep-si-xanh` (đã có routes)
- [ ] Modal fullscreen với thông tin chi tiết
- [ ] Không click được - chỉ có hover effect

**Trả lời:** Sử dụng navigate() từ react-router-dom đến các routes đã có 

**Q4.3:** Background-attachment cho ảnh nền?
- [ ] `fixed` - Nền cố định, tạo hiệu ứng parallax
- [x] `scroll` - Nền cuộn theo trang
- [ ] `local` - Khác

**Trả lời:** `scroll` - Nền cuộn theo trang

---

### 5. Nội dung chi tiết

**Q5.1:** Nội dung đầy đủ cho subtitle "Ý nghĩa tên Viễn tưởng xanh"?

**Trả lời:** không

**Q5.2:** Nội dung đầy đủ cho đoạn mô tả Hero section?
```
"Bằng cách đọc tác phẩm văn học, chúng ta có thể học hỏi và thực hành 
cập nhật hành trạm đồng, tự tin hiểu và thực hành quy trình năng động, 
tối đa hóa cách sống của bản thân, người khác và môi trường."
```

**Trả lời:** ✅ Đã có từ thiết kế

**Q5.3:** Có cần thêm footer không?
- [ ] Có - Với thông tin: `____________________`
- [ ] Không - Chỉ dừng ở Section 3

**Trả lời:** Không

---

### 6. Tích hợp với hệ thống hiện có

**Q6.1:** Tích hợp React Router?
- [x] Có - Đây là React component, sử dụng `<Link>` và `useNavigate()`
- Route path: `____________________`

**Trả lời:** Bắt buộc, là React component

**Q6.2:** Sử dụng AuthContext?
- [x] Có - Import `useAuth()` để:
  - Hiển thị tên user hoặc nút ĐĂNG NHẬP/ĐĂNG KÝ
  - Có thể personalize nội dung dựa trên user role
- [ ] Không - Trang công khai, không cần auth

**Trả lời:** Recommended để có UX tốt hơn

**Q6.3:** Sử dụng API (axios) để fetch dữ liệu động?
- [ ] Có - Fetch stats (số lượng tài liệu, học sinh, etc.)
- [ ] Có - Fetch featured content
- [x] Không - Tất cả nội dung là tĩnh (ảnh và text cố định)

**Trả lời:** Không - Tất cả nội dung là tĩnh (ảnh và text cố định)

---

### 7. Hiệu năng & Tối ưu

**Q7.1:** Có cần lazy loading cho hình ảnh không?
- [x] Có - `loading="lazy"`
- [ ] Không - Load tất cả ngay

**Trả lời:** Có - `loading="lazy"`

**Q7.2:** Có cần responsive images (srcset) không?
- [ ] Có - Chuẩn bị nhiều kích thước ảnh
- [x] Không - Một file ảnh cho tất cả màn hình

**Trả lời:** Không

---

## 📝 GHI CHÚ THÊM

### Component Pattern Recommendations

**1. Sử dụng TypeScript interfaces:**
```typescript
interface HomePageProps {
  // Nếu cần props trong tương lai
}
```

**2. Separate concerns với custom hooks (optional):**
```typescript
// hooks/useScrollReveal.ts
import { useEffect } from 'react'
import anime from 'animejs'

export const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(...)
    // ... logic
    return () => observer.disconnect()
  }, [])
}
```

**3. Tailwind custom styles trong index.css (nếu cần):**
```css
/* Glow effect cho tiêu đề */
.text-glow-blue {
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.6),
               0 0 40px rgba(59, 130, 246, 0.4);
}

/* Gradient text */
.gradient-text {
  @apply bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent;
}
```

**4. Performance tips:**
- Sử dụng `useCallback` cho event handlers nếu pass xuống child components
- Sử dụng `useMemo` cho expensive calculations
- Lazy load animations (chỉ import anime.js khi cần)
- Optimize images: WebP format, responsive sizes

**5. Accessibility:**
- Add `alt` text cho tất cả images
- Ensure keyboard navigation works
- Add ARIA labels nếu cần
- Test với screen readers

### Màu sắc Gradient đề xuất (Tailwind)

**Background gradients:**
- `bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100`
- `bg-gradient-to-r from-blue-600 to-cyan-600` (cho elements)

**Text colors:**
- Primary heading: `text-blue-900` hoặc `text-blue-800`
- Secondary text: `text-gray-700`
- Accent: `text-cyan-600`

**Button/Badge gradients:**
- `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`

### Animation Timing Reference
- **Ultra fast**: 150ms (micro-interactions)
- **Fast**: 300ms (hover effects) ✓ Recommended for cards
- **Normal**: 500-800ms (transitions)
- **Slow**: 1000-1500ms (scroll reveals) ✓ Recommended
- **Very slow**: 2000ms+ (ambient animations)

---

## 🔧 TROUBLESHOOTING

**Issue: Anime.js không hoạt động**
- Check import: `import anime from 'animejs'`
- Verify element exists: `document.querySelector('.scroll-arrow')`
- Check timing: Animation có thể chạy trước khi DOM ready

**Issue: Images không hiển thị**
- Verify import path: `import bgImage from '../img/1x/...'`
- Check file name case-sensitivity
- Ensure images exist trong folder

**Issue: Scroll reveal không trigger**
- Check IntersectionObserver browser support
- Verify threshold và rootMargin values
- Add logging để debug: `console.log('intersecting:', entry.isIntersecting)`

**Issue: TypeScript errors**
- Install types: `npm i -D @types/animejs` (nếu cần)
- Use type assertions nếu cần: `as HTMLElement`

---

**Trả lời:** 

---

## ✅ CHECKLIST TRIỂN KHAI

### Phase 1: Setup
- [ ] Cài đặt animejs: `npm install animejs`
- [ ] Tạo thư mục `frontend/src/img/` (nếu chưa có)
- [ ] Chuẩn bị và copy **6 file ảnh** vào thư mục img/:
  - [ ] `hinh-nen-giao-dien-chinh.png`
  - [ ] `logo-thu-vien.png`
  - [ ] `home-details.png` (sơ đồ hexagon)
  - [ ] `home-ton-trong.png`
  - [ ] `home-su-gia-hoa-binh.png`
  - [ ] `home-hiep-si-xanh.png`
- [ ] Tạo file `HomePage.tsx` trong `frontend/src/pages/`

### Phase 2: Component Structure  
- [ ] Setup imports (React, Router, lucide-react, animejs, AuthContext)
- [ ] Import **TẤT CẢ 6 images**: bg, logo, home-details, home-ton-trong, su-gia, hiep-si
- [ ] Tạo component skeleton với background gradient
- [ ] Implement Header (custom hoặc sử dụng Header.tsx có sẵn)
- [ ] Implement Hero Banner section với:
  - [ ] Tiêu đề "VIỄN TƯỞNG XANH"
  - [ ] Đoạn mô tả dài
  - [ ] Double chevron scroll arrow
- [ ] Implement Section 2 - Sơ đồ hexagon:
  - [ ] Tiêu đề "TRUYỆN KHOA HỌC VIỄN TƯỞNG"
  - [ ] Image home-details.png với fade-scale animation
- [ ] Implement Section 3 - Giáo dục:
  - [ ] Tiêu đề chính
  - [ ] Image home-ton-trong.png với fade-scale animation
  - [ ] Badge "CỘNG ĐỒNG TRÁCH NHIỆM"
  - [ ] 2 Card images (su-gia + hiep-si) với fade-slide animation + click navigation

### Phase 3: Animations
- [ ] Implement scroll arrow loop animation với Anime.js
- [ ] Setup IntersectionObserver cho scroll reveal
- [ ] Implement fade-scale animation cho images
- [ ] Implement fade-slide animation cho cards
- [ ] Add hover effects với Tailwind classes

### Phase 4: Integration
- [ ] Thêm route vào App.tsx
- [ ] Tích hợp AuthContext cho header (nếu cần)
- [ ] Setup navigation cho cards (useNavigate)
- [ ] Test navigation flow

### Phase 5: Styling & Polish
- [ ] Apply gradient colors (xanh dương)
- [ ] Add text glow effect cho tiêu đề "VIỄN TƯỞNG XANH"
- [ ] Fine-tune spacing và paddings
- [ ] Test responsive trên mobile/tablet/desktop
- [ ] Optimize animations (performance)

### Phase 6: Testing & Debug
- [ ] Test tất cả animations
- [ ] Test scroll behavior
- [ ] Test các links và navigation
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Test trên các devices khác nhau
- [ ] Fix any bugs hoặc issues

### Phase 7: Optimization
- [ ] Optimize hình ảnh (compress nếu cần)
- [ ] Add lazy loading: `loading="lazy"` cho images
- [ ] Check bundle size
- [ ] Test performance với Lighthouse

---

**Ngày tạo:** 4/3/2026  
**Người tạo:** Front-end Developer  
**Version:** 2.0 (Updated for React TypeScript)  
**Tech Stack:** React 18.3 + TypeScript + Vite + Tailwind CSS + Anime.js  
**Project:** Web-LMS - Viễn Tưởng Xanh

---

## 📚 REFERENCES & RESOURCES

**Documentation:**
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router v6](https://reactrouter.com/en/main)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Anime.js Documentation](https://animejs.com/documentation/)
- [lucide-react Icons](https://lucide.dev/icons/)

**IntersectionObserver API:**
- [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

**Performance:**
- [Web Vitals](https://web.dev/vitals/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)

---

## 🚀 READY TO IMPLEMENT?

Sau khi hoàn thành phần **CÂU HỎI CẦN LÀM RÕ**, hãy:

1. ✅ Review tất cả requirements
2. ✅ Chuẩn bị **ĐẦY ĐỦ 6 file ảnh** (bg, logo, home-details, home-ton-trong, su-gia, hiep-si)
3. ✅ Cài đặt animejs: `npm install animejs`
4. ✅ Tạo component HomePage.tsx
5. ✅ Follow checklist triển khai từng bước
6. ✅ Test thoroughly trước khi deploy

**ĐẶC BIỆT KHÔNG TẠO THÊM CÁC FILE MD HƯỚNG DẪN KHÁC**

**Good luck! 🎉**