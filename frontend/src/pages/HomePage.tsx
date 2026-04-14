import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import HomePageHeader from '../components/HomePageHeader'
import BackgroundEffects from '../components/BackgroundEffects'

// Import images
import bgImage from '../img/1x/hinh-nen-giao-dien-chinh.png'
import homeDetailsImage from '../img/1x/home-details.png'
import homeTonTrongImage from '../img/1x/home-ton-trong.png'
import suGiaImage from '../img/1x/home-su-gia-hoa-binh.png'
import hiepSiImage from '../img/1x/home-hiep-si-xanh.png'

// Import SVG headings
import vienTuongXanhSVG from '../img/SVG/vien-tuong-xanh.svg'
import truyenKhoaHocSVG from '../img/SVG/truyen-khoa-hoc-vien-tuong.svg'
import giaoDucPhatTrienBenVungSVG from '../img/SVG/giao-duc-phat-trien-ben-vung.svg'
import congDongTrachNhiemSVG from '../img/SVG/cong-dong-trach-nhiem.svg'

const HOME_USAGE_ALERT_STORAGE_KEY = 'home_usage_alert_meta'
const HOME_USAGE_ALERT_TTL_MS = 12 * 60 * 60 * 1000
const HOME_USAGE_ALERT_MESSAGE =
  'Lưu ý sử dụng: Website được thiết kế theo giao diện màn hình máy tính, nên quý thầy cô, các em HS sử dụng máy tính để có được trải nghiệm tốt nhất. Tùy vào cấu hình, người dùng có thể ấn tổ hợp phím Ctrl+ (tăng kích thước) hoặc Ctrl- (giảm kích thước) theo mong muốn.'

export default function HomePage() {
  const navigate = useNavigate()
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([])

  useEffect(() => {
    const now = Date.now()
    const raw = window.localStorage.getItem(HOME_USAGE_ALERT_STORAGE_KEY)

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { expiresAt?: number }
        if (typeof parsed.expiresAt === 'number' && parsed.expiresAt > now) {
          return
        }
      } catch {
        // Ignore malformed data and overwrite below.
      }
      window.localStorage.removeItem(HOME_USAGE_ALERT_STORAGE_KEY)
    }

    // Mark before showing alert to avoid duplicate popup in React StrictMode remounts.
    window.localStorage.setItem(
      HOME_USAGE_ALERT_STORAGE_KEY,
      JSON.stringify({ shownAt: now, expiresAt: now + HOME_USAGE_ALERT_TTL_MS })
    )
    window.alert(HOME_USAGE_ALERT_MESSAGE)
  }, [])

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      
      setShowScrollIndicator(scrollY <= 50)
      setScrollProgress((scrollY / documentHeight) * 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Ripple effect handler
  const createRipple = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const newRipple = { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top, 
      id: Date.now() 
    }
    setRipples(prev => [...prev, newRipple])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 600)
  }

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <div 
      className="min-h-screen relative overflow-x-hidden bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: 'scroll',
        backgroundSize: 'cover'
      }}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #0891b2 100%)'
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress / 100 }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Sparkle/Twinkle Overlay */}
      <BackgroundEffects />
      
      <HomePageHeader />

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 min-h-screen pt-10 md:pt-0">
        <div className="flex flex-col items-center max-w-[1100px] relative z-10 gap-0 -translate-y-0 md:-translate-y-20">
          {/* Title "VIỄN TƯỞNG XANH" with Floating Animation */}
          <motion.img 
            src={vienTuongXanhSVG}
            alt="VIỄN TƯỞNG XANH"
            className="w-full max-w-[1200px] h-auto"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 3px 0 rgba(0,0,0,0.1)) drop-shadow(0 6px 20px rgba(0,0,0,0.2))'
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ 
              opacity: 1, 
              y: [0, -15, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              opacity: { duration: 0.8 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Quote text */}
          <motion.p
            className="mx-auto max-w-[1000px] text-center text-base font-medium leading-relaxed text-[#1e3a8a] sm:text-lg md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Bằng cách đọc tác phẩm văn học, chúng ta có thể hóa thân<br />
            vào nhiều hành trình sống, để rồi thấu cảm những giá trị sống, từ đó biết cách<br />
            tôn trọng bản thân, người khác và môi trường.
            </motion.p>
        </div>
        
        {/* Scroll indicator */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              className="absolute bottom-[100px] -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer text-[#3c4cb0] z-10"
              onClick={handleScrollDown}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 2, y: -20 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="relative"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-10 h-10" strokeWidth={3.5} />
                <ChevronDown className="w-10 h-10 absolute top-4 left-0" strokeWidth={3.5} />
              </motion.div>
              <p className="font-semibold text-xl mt-2">
                Cuộn xuống để tiếp tục đọc
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* INTRODUCTION SECTION */}
      <section className="py-24 md:py-28 text-center px-4 max-w-[1200px] mx-auto">
        <motion.div
          className="mb-12 md:mb-16 flex justify-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <img 
            src={truyenKhoaHocSVG} 
            alt="TRUYỆN KHOA HỌC VIỄN TƯỞNG"
            className="w-full max-w-[800px] h-auto"
          />
        </motion.div>

        <motion.div
          className="w-full mx-auto max-w-[900px]"
          initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ 
            duration: 1,
            delay: 0.2,
            type: 'spring',
            stiffness: 100
          }}
          viewport={{ once: true }}
          whileHover={{
            rotateY: 5,
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          <img 
            src={homeDetailsImage}
            alt="Sơ đồ khoa học viễn tưởng"
            className="w-full h-auto mx-auto max-w-[800px]"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
              transformStyle: 'preserve-3d'
            }}
          />
        </motion.div>
      </section>

      {/* SUSTAINABLE EDUCATION SECTION */}
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="mb-12 md:mb-16 flex justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img 
              src={giaoDucPhatTrienBenVungSVG} 
              alt="GIÁO DỤC PHÁT TRIỂN BỀN VỮNG"
              className="w-full max-w-[800px] h-auto"
            />
          </motion.div>

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <motion.img
              src={homeTonTrongImage}
              alt="Sơ đồ Giáo dục Phát triển Bền vững"
              className="w-full h-auto mx-auto object-contain max-w-[1000px]"
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { duration: 0.8, type: 'spring' }
                }
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY SECTION */}
      <section className="pt-24 pb-32 md:pt-32 md:pb-40 text-center px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="mb-16 md:mb-20 flex justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <img 
              src={congDongTrachNhiemSVG} 
              alt="CỘNG ĐỒNG TRÁCH NHIỆM"
              className="w-full max-w-[600px] h-auto"
            />
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-20">
            {/* Icon 1: Sứ giả hòa bình */}
            <div className="relative">
              <motion.img
                src={suGiaImage}
                alt="Sứ giả hòa bình"
                className="w-72 h-72 md:w-96 md:h-96 object-contain cursor-pointer relative z-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: -3,
                  filter: 'brightness(1.1) drop-shadow(0 20px 40px rgba(59, 130, 246, 0.4))',
                  transition: { duration: 0.3, type: 'spring', stiffness: 300 }
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                onClick={(e) => {
                  createRipple(e)
                  navigate('/cong-dong/su-gia-hoa-binh')
                }}
              />
              {ripples.map(ripple => (
                <motion.div
                  key={ripple.id}
                  className="absolute rounded-full border-4 border-blue-400 pointer-events-none"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: 0,
                    height: 0
                  }}
                  animate={{
                    width: 300,
                    height: 300,
                    x: -150,
                    y: -150,
                    opacity: 0,
                    borderWidth: 0
                  }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </div>

            {/* Icon 2: Hiệp sĩ xanh */}
            <div className="relative">
              <motion.img
                src={hiepSiImage}
                alt="Hiệp sĩ xanh"
                className="w-72 h-72 md:w-96 md:h-96 object-contain cursor-pointer relative z-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 3,
                  filter: 'brightness(1.1) drop-shadow(0 20px 40px rgba(16, 185, 129, 0.4))',
                  transition: { duration: 0.3, type: 'spring', stiffness: 300 }
                }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                onClick={(e) => {
                  createRipple(e)
                  navigate('/cong-dong/hiep-si-xanh')
                }}
              />
              {ripples.map(ripple => (
                <motion.div
                  key={ripple.id}
                  className="absolute rounded-full border-4 border-green-400 pointer-events-none"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: 0,
                    height: 0
                  }}
                  animate={{
                    width: 300,
                    height: 300,
                    x: -150,
                    y: -150,
                    opacity: 0,
                    borderWidth: 0
                  }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
