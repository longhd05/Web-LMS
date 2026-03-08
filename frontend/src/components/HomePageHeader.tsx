import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

/**
 * HomePageHeader Component
 * 
 * A futuristic sci-fi style header with:
 * - Pill-shaped container with gradient background
 * - Overlapping circular logo in the center
 * - Left: site title
 * - Right: login/register buttons + hamburger menu
 */
export default function HomePageHeader() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-6 z-50 px-4 md:px-8">
      {/* Main container - horizontally centered with responsive width (80-90%) */}
      <div className="mx-auto relative" style={{ maxWidth: '90%' }}>
        
        {/* Pill-shaped navigation bar with double border and glow effects */}
        <div
          className="relative flex items-center justify-between px-8 md:px-16"
          style={{
            height: '70px',
            borderRadius: '999px',
            background: `
              linear-gradient(
                to bottom,
                rgba(255,255,255,0.25) 0%,
                rgba(255,255,255,0.08) 15%,
                rgba(255,255,255,0) 40%
              ),
              linear-gradient(
                90deg,
                #1d3a88 0%,
                #2a6c9e 50%,
                #2ba7a1 100%
              )
            `,
            border: '2px solid rgb(255, 255, 255)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15), 0 0 20px rgba(0,150,200,0.2)',
          }}
        >
          {/* Inner border effect using ::before-like div */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '3px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              zIndex: 1,
            }}
          />
          
          {/* Logo cutout connector - left side */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 'calc(50% - 50px)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '55px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05))',
              clipPath: 'polygon(0 30%, 100% 45%, 100% 55%, 0 70%)',
              zIndex: 1,
            }}
          />
          
          {/* Logo cutout connector - right side */}
          <div
            className="absolute pointer-events-none"
            style={{
              right: 'calc(50% - 50px)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '55px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)',
              clipPath: 'polygon(0 45%, 100% 30%, 100% 70%, 0 55%)',
              zIndex: 1,
            }}
          />
          {/* LEFT SECTION - Site Title */}
          <div className="flex-1 relative z-10">
            <h1 
              className="text-white uppercase text-l sm:text-sm md:text-base whitespace-nowrap"
              style={{ 
                fontWeight: 600, 
                letterSpacing: '0.05em'
              }}
            >
              THƯ VIỆN KHOA HỌC VIỄN TƯỞNG
            </h1>
          </div>

          {/* CENTER SECTION - Circular Logo (overlaps header) */}
          <div
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
            style={{
              transform: "translate(-50%, -50%)",
              width: "110px",
              height: "110px",
              zIndex: 20
            }}
          >

            {/* VIỀN SVG */}
            {/* <img
              src="/src/img/SVG/vien-logo.svg"
              alt="viền logo"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            /> */}

            {/* LOGO Ở GIỮA */}
            <img
              src="/src/img/SVG/logo.svg"
              alt="logo"
              style={{
                transform: "scale(1.3)",
                transformOrigin: "center",
                objectFit: "contain",
                position: "relative",
                zIndex: 2
              }}
            />

          </div>

          {/* RIGHT SECTION - Buttons and Menu */}
          <div className="flex-1 flex items-center justify-end gap-3 relative z-10">
            {/* Login button - hidden on mobile */}
            <button
              onClick={() => navigate('/dang-nhap')}
              className="hidden md:block text-white text-l font-semibold rounded-full transition-all duration-300"
              style={{
                background: 'transparent',
                padding: '6px 18px',
                letterSpacing: '0.03em'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ĐĂNG NHẬP
            </button>

            {/* Register button - hidden on mobile */}
            <button
              onClick={() => navigate('/dang-ky')}
              className="hidden md:block text-white text-l font-semibold rounded-full transition-all duration-300"
              style={{
                background: 'transparent',
                padding: '6px 18px',
                letterSpacing: '0.03em'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ĐĂNG KÝ
            </button>

            {/* Hamburger menu icon - always visible */}
            <button
              className="text-white p-2 hover:bg-white/10 rounded transition-all duration-300"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <X className="h-6 w-6" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu
        {menuOpen && (
          <div 
            className="mt-4 rounded-3xl overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #1e3c8f, #1e7ea0)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  navigate('/dang-nhap')
                  setMenuOpen(false)
                }}
                className="block w-full text-center text-white font-semibold py-3 px-4 rounded-full border border-white/40 hover:bg-white/10 transition-all duration-300"
              >
                ĐĂNG NHẬP
              </button>
              <button
                onClick={() => {
                  navigate('/dang-ky')
                  setMenuOpen(false)
                }}
                className="block w-full text-center text-white font-semibold py-3 px-4 rounded-full border border-white/40 hover:bg-white/10 transition-all duration-300"
              >
                ĐĂNG KÝ
              </button>
            </div>
          </div>
        )} */}
        {/* Mobile popup */}
        {menuOpen && (
          <div className="absolute right-4 top-16 z-50">
            <div
              className="rounded-2xl p-4 shadow-xl w-56"
              style={{
                background: "#c7d9e0",
                border: "2px solid #4aa3c0",
              }}
            >
              <p className="text-blue-900 text-sm font-semibold">
                Ý nghĩa tên <br />
                "Viễn tưởng xanh"
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
