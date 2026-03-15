import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import CongDongTopNavBar from '../../components/student/Layout/CongDongTopNavBar'
import api from '../../api/axios'

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
    school?: string
    date: string
    likes?: number
    completed?: boolean
}

interface CommunityPostSubmission {
    id: string
    status: string
    readingAnswersJson?: string | null
    integrationFile?: { url: string; filename: string; mimetype: string } | null
    student: { id: string; name: string; avatarUrl?: string | null }
    assignment: {
        id: string
        type: 'READING' | 'INTEGRATION'
        libraryItem: {
            id: string
            title: string
            content: string
            readingQuestionsJson?: string | null
        }
    }
    review?: { resultStatus: 'PASSED' | 'FAILED' } | null
}

interface CommunityPostData {
    id: string
    communityKey: string
    publishedAt: string
    publisher: { id: string; name: string; avatarUrl?: string | null }
    submission: CommunityPostSubmission
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
    communityKey?: string
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
    communityKey,
}: CongDongTemplateProps) {
    const [currentPage, setCurrentPage] = useState(0)
    const [slideDirection, setSlideDirection] = useState(0)
    const [showScroll, setShowScroll] = useState(true)
    const [apiPosts, setApiPosts] = useState<CommunityPostData[]>([])
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

    const displayCards = useMemo<CommunityCardItem[]>(() => {
        if (communityKey && apiPosts.length > 0) {
            return apiPosts.map(post => ({
                id: post.id,
                name: post.submission.student.name,
                className: '',
                school: post.submission.assignment.libraryItem.title,
                date: new Date(post.publishedAt).toLocaleDateString('vi-VN'),
                completed: post.submission.review?.resultStatus === 'PASSED',
            }))
        }
        return communityCards
    }, [communityKey, apiPosts, communityCards])

    const cardsPerPage = 8
    const totalPages = Math.ceil(displayCards.length / cardsPerPage)
    const startIndex = currentPage * cardsPerPage
    const endIndex = startIndex + cardsPerPage
    const currentCards = displayCards.slice(startIndex, endIndex)

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setSlideDirection(-1)
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setSlideDirection(1)
            setCurrentPage(currentPage + 1)
        }
    }

    useEffect(() => {
        const onScroll = () => setShowScroll(window.scrollY <= 100)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (!communityKey) return
        const fetchPosts = async () => {
            try {
                const res = await api.get(`/community/${communityKey}/posts?limit=100`)
                setApiPosts(res.data.data || [])
            } catch {
                // silent fail – keep static placeholder cards
            }
        }
        fetchPosts()
    }, [communityKey])

    const selectedPost = useMemo(
        () => apiPosts.find(p => p.id === selectedPostId) ?? null,
        [apiPosts, selectedPostId]
    )

    const handleCardClick = (cardId: string) => {
        if (!communityKey) return
        setSelectedPostId(cardId)
    }

    const handleCloseModal = () => setSelectedPostId(null)

    const parseReadingAnswers = (sub: CommunityPostSubmission) => {
        const questions: Array<{ id: string; text: string; options?: string[] }> = (() => {
            try {
                const p = JSON.parse(sub.assignment.libraryItem.content)
                return Array.isArray(p.questions) ? p.questions : []
            } catch {
                return []
            }
        })()
        const answers: Record<string, number | string> = (() => {
            if (!sub.readingAnswersJson) return {}
            try {
                const p = JSON.parse(sub.readingAnswersJson)
                if (Array.isArray(p)) {
                    return p.reduce<Record<string, number | string>>((acc, v, i) => { acc[String(i)] = v; return acc }, {})
                }
                return p as Record<string, number | string>
            } catch { return {} }
        })()
        return { questions, answers }
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: secondaryColor }}>
            <CongDongTopNavBar />
            <style dangerouslySetInnerHTML={{
                __html: `
                    .background-image-section {
                        background-size: ${backgroundSize};
                        min-height: 650px;
                    }
                    .spacer-top {
                        height: ${backgroundPaddingTop || '0'};
                        position: relative;
                        z-index: 0;
                    }
                    .bg-wrapper {
                        margin-top: -${backgroundPaddingTop || '0'};
                    }
                    /* Màn hình rộng: aspect ratio >= 2:1 (a gấp 2 b) */
                    // @media (min-aspect-ratio: 2/1) {
                    //     .background-image-section {
                    //         background-size: ${backgroundSize} !important;
                    //         min-height: 50vw !important;
                    //     }
                    //     .spacer-top {
                    //         height: calc(${backgroundPaddingTop || '0'} + 80px);
                    //     }
                    //     .bg-wrapper {
                    //         margin-top: calc(-${backgroundPaddingTop || '0'} - 80px);
                    //     }
                    // }
                    @media (min-aspect-ratio: 1.5/1) {
                        .background-image-section {
                            background-size: ${backgroundSize} !important;
                            min-height: 45vw !important;
                        }
                        .spacer-top {
                            height: calc(${backgroundPaddingTop || '0'} + 80px);
                        }
                        .bg-wrapper {
                            margin-top: calc(-${backgroundPaddingTop || '0'} - 80px);
                        }
                    }
                    @media (min-aspect-ratio: 2/1) {
                        .background-image-section {
                            background-size: ${backgroundSize} !important;
                            min-height: 42vw !important;
                        }
                        .subtitle-overlay {
                            bottom: 12% !important;
                        }
                    }    
                    @media (max-width: 768px) {
                        .background-image-section {
                            background-size: ${backgroundSizeMobile} !important;
                        }
                    }
                    @keyframes bgFloat {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(12px); }
                    }
                    .bg-animate {
                        animation: bgFloat 4s ease-in-out infinite;
                    }
                `
            }} />

            {/* Div trống để tạo khoảng cách với header */}
            <div className="spacer-top"></div>

            {/* Background Image Section with overlapping header */}
            {backgroundImage && (
                <div className="relative bg-wrapper" style={{ zIndex: 1 }}>
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
                    <div className="w-full relative" style={{ overflow: 'hidden' }}>
                        <div
                            className="w-full relative background-image-section bg-animate"
                            style={{
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundPosition: backgroundPosition,
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                        </div>
                        {/* Search/Info Box - Overlay on background (outside bg-animate) */}
                        <div className="absolute inset-x-0 px-4 subtitle-overlay" style={{ bottom: subtitleBoxBottom }}>
                            <div className="max-w-6xl mx-auto flex flex-col items-center">
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
                                {/* Cuộn xuống để tiếp tục đọc */}
                                <div className="h-[72px]">
                                    <AnimatePresence>
                                        {showScroll && (
                                            <motion.div
                                                className="flex flex-col items-center cursor-pointer mt-4"
                                                onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <motion.div
                                                    className="relative mb-1"
                                                    animate={{ y: [0, 8, 0] }}
                                                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <ChevronDown className="w-8 h-8 text-[#303f86]" strokeWidth={3.5} />
                                                    <ChevronDown className="w-8 h-8 text-[#303f86] absolute top-3 left-0" strokeWidth={3.5} />
                                                </motion.div>
                                                <p className="font-semibold text-lg text-[#303f86] mt-4">
                                                    Cuộn xuống để tiếp tục đọc
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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

                {/* Cùng Xem Section - Video */}
                {videoUrl && (
                    <motion.div
                        className="max-w-7xl mx-auto px-4 mb-[150px]"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
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
                        <motion.div
                            className="bg-white rounded-3xl p-12 max-w-3xl mx-auto shadow-lg aspect-video flex items-center justify-center"
                            style={{ border: `2px solid ${primaryColor}` }}
                            whileHover={{ scale: 1.03, boxShadow: `0 12px 40px ${primaryColor}44` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="text-center">
                                <p className="text-4xl font-semibold" style={{ color: '#303f86' }}>
                                    ẢNH<br />VIDEO
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Cùng Đọc Section - Lessons */}
                <motion.div
                    className="max-w-7xl mx-auto px-4 mb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    viewport={{ once: true }}
                >
                    <motion.div
                        className="bg-white rounded-3xl p-12 max-w-4xl mx-auto shadow-lg"
                        style={{ border: `2px solid ${primaryColor}` }}
                        whileHover={{ scale: 1.02, boxShadow: `0 12px 40px ${primaryColor}44` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
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
                    </motion.div>
                </motion.div>


                {/* Gradient Transition */}
                <div style={{
                    background: `linear-gradient(to bottom, ${accentColor} 0%, ${secondaryColor} 100%)`,
                    height: '100px'
                }}></div>
            </div>

            {/* Cộng Đồng Section Wrapper */}
            <div style={{ backgroundColor: secondaryColor }}>
                {/* Cộng Đồng Section - Community Cards */}
                <motion.div
                    className="max-w-7xl mx-auto px-4 pb-12"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
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
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={currentPage}
                                    className="grid grid-cols-4 gap-6 max-w-5xl mx-auto"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {currentCards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="relative rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer"
                                            style={{
                                                backgroundColor: primaryColor,
                                                padding: '2px'
                                            }}
                                            onClick={() => handleCardClick(card.id)}
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
                                                                {card.name}{card.className ? ` - ${card.className}` : ''}
                                                            </h3>
                                                            {card.school && (
                                                            <p className="text-[17px] font-bold" style={{ color: primaryColor }}>
                                                                {card.school}
                                                            </p>
                                                            )}
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
                                </motion.div>
                            </AnimatePresence>
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
                </motion.div>
            </div>

            {/* Submission View Modal */}
            {selectedPostId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] mx-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedPost ? (() => {
                            const sub = selectedPost.submission
                            const { questions, answers } = parseReadingAnswers(sub)
                            return (
                                <div className="mx-auto w-full">
                                    <div className="mx-auto rounded-[36px] bg-white p-2 w-full">
                                        <div
                                            className="rounded-[30px] border-2 border-transparent bg-[#f3fffb]"
                                            style={{
                                                background: 'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
                                            }}
                                        >
                                            <div className="overflow-y-auto p-6 sm:p-8">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h1 className="text-3xl font-black text-[#1f3f8f] sm:text-4xl">{sub.student.name}</h1>
                                                    <button
                                                        onClick={handleCloseModal}
                                                        className="text-3xl font-bold text-[#1f3f8f] hover:opacity-70 ml-4 leading-none"
                                                        aria-label="Đóng"
                                                    >
                                                        ×
                                                    </button>
                                                </div>

                                                {sub.assignment.type === 'READING' ? (
                                                    <div className="mb-7 space-y-5 text-[#1f3f8f]">
                                                        {questions.length > 0 ? (
                                                            questions.map((q, idx) => (
                                                                <div key={idx} className="text-base font-semibold leading-relaxed sm:text-lg">
                                                                    <p className="font-bold">
                                                                        Câu {idx + 1}: {q.text} {q.options?.length ? '(câu trắc nghiệm)' : '(câu tự luận ngắn)'}
                                                                    </p>
                                                                    <p className="pl-4 sm:pl-8">
                                                                        {'=> '}Đáp án của học sinh
                                                                        {(() => {
                                                                            const answer = answers[q.id]
                                                                            if (answer === undefined || answer === null) return ': (chưa trả lời)'
                                                                            if (typeof answer === 'number' && q.options?.length) return `: ${q.options[answer] ?? '(chưa trả lời)'}`
                                                                            return `: ${String(answer)}`
                                                                        })()}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-base font-semibold sm:text-lg">
                                                                Không có câu hỏi để hiển thị.
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mb-7 text-[#1f3f8f]">
                                                        <p className="text-xl font-semibold sm:text-2xl">{sub.assignment.libraryItem.title}</p>
                                                        <p className="mt-1 text-base sm:text-lg">{'→ '}File mà học sinh tải lên (Word / Hình ảnh / Video)</p>
                                                        {sub.integrationFile ? (
                                                            <a
                                                                href={`${api.defaults.baseURL}${sub.integrationFile.url}`}
                                                                download={sub.integrationFile.filename}
                                                                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#cbeff2] px-4 py-2 text-base font-bold text-[#1f3f8f] sm:text-lg hover:bg-[#a8e8ee] transition-colors"
                                                            >
                                                                ⬇ Tải file: {sub.integrationFile.filename}
                                                            </a>
                                                        ) : (
                                                            <p className="mt-3 text-base text-gray-500">Không có file đính kèm.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })() : (
                            <div className="bg-white rounded-[28px] p-12 flex justify-center">
                                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#1f3f8f]" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
