import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header'

// Import images - Đảm bảo các file ảnh này tồn tại trong thư mục img/
import bgImage from '../img/1x/hinh-nen-giao-dien-chinh.png'
import homeDetailsImage from '../img/1x/home-details.png'
import homeTonTrongImage from '../img/1x/home-ton-trong.png'
import suGiaImage from '../img/1x/home-su-gia-hoa-binh.png'
import hiepSiImage from '../img/1x/home-hiep-si-xanh.png'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Header - Fixed top với backdrop blur */}
      <Header />

      {/* Hero Section - Background gradient xanh dương */}
      <section 
        className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20 bg-gradient-to-br from-cyan-100 via-blue-100 to-cyan-200 relative overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(to bottom right, rgba(207, 250, 254, 0.9), rgba(191, 219, 254, 0.9), rgba(207, 250, 254, 0.9)), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        {/* Main Title */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-blue-900 mb-8 tracking-tight">
          VIỄN TƯỞNG XANH
        </h1>
        
        {/* Description */}
        <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-4xl mb-12 leading-relaxed px-4">
          Bằng cách đọc tác phẩm văn học, chúng ta có thể học hỏi và thực hành 
          cập nhật hành trạm đồng, tự tin hiểu và thực hành quy trình năng động, 
          tối đa hóa cách sống của bản thân, người khác và môi trường.
        </p>
        
        {/* Scroll indicator - Double Chevron */}
        <motion.div 
          className="flex flex-col items-center gap-2 mt-8"
          animate={{ y: [0, 15, 0] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <ChevronDown className="w-10 h-10 text-blue-600" strokeWidth={2.5} />
            <ChevronDown className="w-10 h-10 text-blue-600 absolute top-4 left-0" strokeWidth={2.5} />
          </div>
          <p className="text-blue-700 font-semibold text-sm md:text-base">
            Cuộn xuống để tiếp tục đọc
          </p>
        </motion.div>
      </section>

      {/* Section 2: Truyện Khoa Học Viễn Tưởng - Hexagon Diagram */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-12">
            TRUYỆN KHOA HỌC VIỄN TƯỞNG
          </h2>
          
          {/* Hexagon diagram image with fade-scale animation */}
          <motion.img 
            src={homeDetailsImage}
            className="mx-auto w-full max-w-5xl"
            alt="Sơ đồ truyện khoa học viễn tưởng"
            loading="lazy"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          />
        </div>
      </section>

      {/* Section 3: Giáo Dục Phát Triển Bền Vững */}
      <section className="py-20 bg-gradient-to-br from-cyan-200 via-blue-300 to-purple-300 text-center">
        <div className="container mx-auto px-4">
          {/* Main Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12 drop-shadow-lg">
            GIÁO DỤC PHÁT TRIỂN BỀN VỮNG
          </h2>
          
          {/* Tôn Trọng Image with fade-scale animation */}
          <motion.img 
            src={homeTonTrongImage}
            className="mx-auto mt-8 mb-12 max-w-3xl w-full"
            alt="Tôn trọng"
            loading="lazy"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          />
          
          {/* Cộng Đồng Trách Nhiệm Badge */}
          <div className="mb-16">
            <span className="inline-block px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-full font-bold text-xl md:text-2xl shadow-2xl">
              CỘNG ĐỒNG TRÁCH NHIỆM
            </span>
          </div>
          
          {/* 2 Cards - Sứ Giả Hòa Bình & Hiệp Sĩ Xanh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
            {/* Card 1: Sứ Giả Hòa Bình - Using IMAGE */}
            <motion.img
              src={suGiaImage}
              onClick={() => navigate('/cong-dong/su-gia-hoa-binh')}
              className="card-hover w-full rounded-3xl cursor-pointer shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-105 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
              alt="Sứ Giả Hòa Bình & Hòa Giải"
              loading="lazy"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            />

            {/* Card 2: Hiệp Sĩ Xanh - Using IMAGE */}
            <motion.img
              src={hiepSiImage}
              onClick={() => navigate('/cong-dong/hiep-si-xanh')}
              className="card-hover w-full rounded-3xl cursor-pointer shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-105 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
              alt="Hiệp Sĩ Xanh"
              loading="lazy"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            />
          </div>
        </div>
      </section>

      {/* Footer (optional) */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Viễn Tưởng Xanh - Thế Giới Khoa Học Viễn Tưởng
        </p>
      </footer>
    </div>
  )
}
