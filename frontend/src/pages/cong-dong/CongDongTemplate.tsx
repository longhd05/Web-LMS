import { ReactNode, useState } from 'react'

export interface LessonItem {
    id: string
    title: string
    description: string
    imageUrl?: string
}

export interface CommunityCardItem {
    id: string
    name: string
    className: string
    school: string
    date: string
    likes?: number
    completed?: boolean
}

export interface CongDongTemplateProps {
    title: string
    subtitle: string
    headerImage?: string
    backgroundImage?: string
    backgroundSize?: string // Default: '113%'
    backgroundSizeMobile?: string // Default: '200%'
    backgroundPosition?: string // Default: 'center bottom' - vị trí của background image
    backgroundPaddingTop?: string // Default: '0' - padding top của background section
    subtitleBoxBottom?: string // Default: '0' - vị trí bottom của subtitle box
    primaryColor: string
    secondaryColor: string
    accentColor: string
    videoUrl?: string
    lessons: LessonItem[]
    communityCards: CommunityCardItem[]
}

export default function CongDongTemplate({
    title,
    subtitle,
    headerImage,
    backgroundImage,
    backgroundSize = '113%',
    backgroundSizeMobile = '200%',
    backgroundPosition = 'center bottom',
    backgroundPaddingTop = '0',
    subtitleBoxBottom = '0',
    primaryColor,
    secondaryColor,
    accentColor,
    videoUrl,
    lessons,
    communityCards,
}: CongDongTemplateProps) {
    const [currentPage, setCurrentPage] = useState(0)
    const cardsPerPage = 8
    const totalPages = Math.ceil(communityCards.length / cardsPerPage)
    const startIndex = currentPage * cardsPerPage
    const endIndex = startIndex + cardsPerPage
    const currentCards = communityCards.slice(startIndex, endIndex)

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1)
        }
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: secondaryColor }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                    .background-image-section {
                        background-size: ${backgroundSize};
                    }
                    @media (max-width: 768px) {
                        .background-image-section {
                            background-size: ${backgroundSizeMobile} !important;
                        }
                    }
                `
            }} />
            {/* Background Image Section with overlapping header */}
            {backgroundImage && (
                <div className="relative" style={{ paddingTop: backgroundPaddingTop }}>
                    {/* Header Section with Title - Overlapping */}
                    {/* Title phần background */}
                    {/* <div className="absolute top-0 left-0 right-0 z-20 pt-0 pb-0 px-4" style={{ overflow: 'visible' }}>
                        <div className="max-w-7xl mx-auto text-center">
                            <div className="relative mx-auto" style={{ width: '900px', height: '280px', overflow: 'visible' }}>
                                <svg viewBox="0 -250 700 450" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                                    <defs>
                                        <path id="topCurve" d="M 100,150 Q 350,-150 600,150" fill="transparent" />
                                    </defs>
                                    <text style={{
                                        fill: primaryColor,
                                        stroke: 'white',
                                        strokeWidth: '10px',
                                        fontSize: '100px',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        paintOrder: 'stroke fill'
                                    }}>
                                        <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
                                            {title}
                                        </textPath>
                                    </text>
                                </svg>
                            </div>
                        </div>
                    </div> */}

                    {/* Background Image */}
                    <div
                        className="w-full relative background-image-section"
                        style={{
                            backgroundImage: `url(${backgroundImage})`,
                            minHeight: '650px',
                            backgroundPosition: backgroundPosition,
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        {/* Search/Info Box - Overlay on background */}
                        <div className="absolute inset-x-0 px-4" style={{ bottom: subtitleBoxBottom }}>
                            <div className="max-w-6xl mx-auto" >
                                <div
                                    className="w-full px-10 rounded-[35px] text-center flex items-center justify-center h-[100px]"
                                    style={{
                                        color: '#303f86',
                                        backgroundColor: 'rgba(223, 250, 239, 0.6)',
                                        fontSize: '30px',
                                        fontWeight: '500',
                                    }}
                                >
                                    {subtitle}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gradient Transition */}
            <div style={{
                background: `linear-gradient(to bottom, ${secondaryColor} 0%, ${accentColor} 100%)`,
                height: '100px'
            }}></div>

            {/* Lower Section Wrapper with New Background */}
            <div style={{ backgroundColor: accentColor }}>
                {/* Cuộn xuống để tiếp tục đọc */}
                <div className="relative pt-2 pb-8 flex flex-col items-center justify-center" style={{ backgroundColor: accentColor }}>
                    {/* Animated Chevron Arrows */}
                    <div className="flex flex-col items-center mb-4">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes bounceDown {
                                0%, 100% {
                                    transform: translateY(0);
                                }
                                50% {
                                    transform: translateY(10px);
                                }
                            }
                            .animate-bounce-down {
                                animation: bounceDown 1.5s ease-in-out infinite;
                            }
                        `}} />
                        <div className="animate-bounce-down">
                            <svg
                                width="64"
                                height="64"
                                viewBox="0 0 64 64"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* First Chevron */}
                                <path
                                    d="M8 18 L32 42 L56 18"
                                    stroke="#303f86"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                                {/* Second Chevron */}
                                <path
                                    d="M8 28 L32 52 L56 28"
                                    stroke="#303f86"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Text */}
                    <p className="text-2xl" style={{ color: '#303f86' }}>
                        Cuộn xuống để tiếp tục đọc
                    </p>
                </div>

                {/* Cùng Xem Section - Video */}
                {videoUrl && (
                    <div className="max-w-7xl mx-auto px-4 mb-[150px]">
                        <h2
                            className="text-6xl font-bold text-center mb-8 uppercase"
                            style={{
                                color: primaryColor,
                                WebkitTextStroke: '3px white',
                                paintOrder: 'stroke fill',
                                textShadow: '0 0 10px rgba(255,255,255,0.5)'
                            }}
                        >
                            CÙNG XEM
                        </h2>
                        <div className="bg-white rounded-3xl p-12 max-w-3xl mx-auto shadow-lg aspect-video flex items-center justify-center" style={{
                            border: `2px solid ${primaryColor}`
                        }}>
                            <div className="text-center">
                                <p className="text-4xl font-semibold" style={{ color: '#303f86' }}>
                                    ẢNH<br />VIDEO
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cùng Đọc Section - Lessons */}
                <div className="max-w-7xl mx-auto px-4 mb-12">
                    <div className="bg-white rounded-3xl p-12 max-w-4xl mx-auto shadow-lg" style={{
                        border: `2px solid ${primaryColor}`
                    }}>
                        {/* Title inside box */}
                        <h2
                            className="text-6xl font-bold text-center mb-12 uppercase"
                            style={{
                                color: primaryColor,
                                WebkitTextStroke: '3px white',
                                paintOrder: 'stroke fill',
                                textShadow: '0 0 10px rgba(255,255,255,0.5)'
                            }}
                        >
                            CÙNG ĐỌC
                        </h2>

                        {lessons.map((lesson, index) => (
                            <div key={lesson.id} className="mb-16 last:mb-0">
                                {/* Title */}
                                <h3 className="text-center font-bold text-2xl mb-8" style={{ color: primaryColor }}>
                                    {lesson.title}
                                </h3>

                                {/* Layout */}
                                <div className="flex gap-8 items-center">
                                    {/* Left side - Ngữ liệu */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-2xl font-semibold" style={{ color: primaryColor }}>
                                            Ngữ liệu
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex flex-col items-center" style={{ height: '400px' }}>
                                        <div
                                            className="w-1 flex-1"
                                            style={{ backgroundColor: primaryColor, maxHeight: '10%' }}
                                        ></div>
                                        <div
                                            className="w-10 h-10 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: '#64aab8' }}
                                        ></div>
                                        <div
                                            className="w-1 flex-1"
                                            style={{ backgroundColor: primaryColor }}
                                        ></div>
                                    </div>

                                    {/* Right side - ẢNH */}
                                    <a
                                        href={lesson.imageUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                        style={{
                                            backgroundColor: '#9FD9B5',
                                            height: '400px'
                                        }}
                                    >
                                        {lesson.imageUrl ? (
                                            <img
                                                src={lesson.imageUrl}
                                                alt={lesson.title}
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <p className="text-3xl font-semibold" style={{ color: primaryColor }}>
                                                ẢNH
                                            </p>
                                        )}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Gradient Transition */}
                <div style={{
                    background: `linear-gradient(to bottom, ${accentColor} 0%, ${secondaryColor} 100%)`,
                    height: '100px'
                }}></div>
            </div>

            {/* Cộng Đồng Section Wrapper */}
            <div style={{ backgroundColor: secondaryColor }}>
                {/* Cộng Đồng Section - Community Cards */}
                <div className="max-w-7xl mx-auto px-4 pb-12">
                    <h2
                        className="text-6xl font-bold text-center mb-20 uppercase"
                        style={{
                            color: primaryColor,
                            WebkitTextStroke: '3px white',
                            paintOrder: 'stroke fill',
                            textShadow: '0 0 10px rgba(255,255,255,0.5)'
                        }}
                    >
                        CỘNG ĐỒNG
                    </h2>
                    <div className="relative">
                        {/* Navigation arrows */}
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: 'white',
                                border: `4px solid ${primaryColor}`
                            }}
                        >
                            <svg className="w-40 h-40" viewBox="0 0 24 24">
                                <path d="M15 18l-8-6 8-6v12z" fill={primaryColor} stroke={primaryColor} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
                            </svg>
                        </button>

                        {/* Grid Layout - 2 rows x 4 columns */}
                        <div className="px-16">
                            <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
                                {currentCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="relative rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 hover:-translate-y-1"
                                        style={{
                                            backgroundColor: primaryColor,
                                            padding: '2px'
                                        }}
                                    >
                                        {/* White spacing layer */}
                                        <div className="bg-white rounded-3xl" style={{ padding: '2.5px' }}>
                                            {/* Inner card with gradient border effect */}
                                            <div
                                                className="relative rounded-3xl overflow-hidden"
                                                style={{
                                                    background: `linear-gradient(to right, ${primaryColor} 0%, #d4f542 100%)`,
                                                    padding: '2px'
                                                }}
                                            >
                                                <div className="bg-white rounded-3xl p-4 relative">

                                                    {/* Top section with name, class, and school */}
                                                    <div className="mb-3 text-center">
                                                        <h3 className="text-[17px] font-bold leading-tight uppercase" style={{ color: primaryColor }}>
                                                            {card.name} - {card.className}
                                                        </h3>
                                                        <p className="text-[17px] font-bold" style={{ color: primaryColor }}>
                                                            {card.school}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-semibold" style={{ color: primaryColor }}>
                                                            {card.date}
                                                        </p>
                                                    </div>

                                                    {/* Large empty area */}
                                                    <div className="h-40 mb-4"></div>

                                                    {/* Gradient divider line */}
                                                    <div
                                                        className=" h-[2px] w-full"
                                                        style={{
                                                            background: `linear-gradient(to right, ${primaryColor} 0%, #d4f542 100%)`
                                                        }}
                                                    ></div>

                                                    {/* Bottom icons */}
                                                    <div className="flex items-center justify-between">
                                                        <button className="p-1">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-1">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages - 1}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: 'white',
                                border: `4px solid ${primaryColor}`
                            }}
                        >
                            <svg className="w-40 h-40" viewBox="0 0 24 24">
                                <path d="M9 6l8 6-8 6V6z" fill={primaryColor} stroke={primaryColor} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
