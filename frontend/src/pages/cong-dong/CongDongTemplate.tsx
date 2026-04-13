import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import CongDongTopNavBar from '../../components/student/Layout/CongDongTopNavBar'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'

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
    likedByMe?: boolean
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
    likedByMe?: boolean
    publisher: { id: string; name: string; avatarUrl?: string | null }
    comments: CommunityPostCommentData[]
    submission: CommunityPostSubmission
}

interface CommunityPostCommentData {
    id: string
    content: string
    createdAt: string
    user: { id: string; name: string; role: 'STUDENT' | 'TEACHER' | string }
}

const QUESTION_PREFIX_REGEX = /^\s*câu\s*\d+\s*[:.)-]\s*/i

function formatQuestionLabel(questionText: string, index: number): string {
    const text = questionText.trim()
    return QUESTION_PREFIX_REGEX.test(text) ? text : `Câu ${index + 1}: ${text}`
}

export interface CongDongTemplateProps {
    title: string
    subtitle: ReactNode
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
    readSectionTitle?: string
    readSectionLayout?: 'split' | 'single-image'
    readSectionImageUrl?: string
    videoUrl?: string
    watchImageUrl?: string
    lessons?: LessonItem[]
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
    readSectionTitle = 'CÙNG ĐỌC',
    readSectionImageUrl,
    videoUrl,
    watchImageUrl,
    communityCards,
    communityKey,
}: CongDongTemplateProps) {
    const { user } = useAuth()
    const [currentPage, setCurrentPage] = useState(0)
    const [slideDirection, setSlideDirection] = useState(0)
    const [showScroll, setShowScroll] = useState(true)
    const [showReadScroll, setShowReadScroll] = useState(false)
    const [readSectionScrollTop, setReadSectionScrollTop] = useState(0)
    const [watchScrollProgress, setWatchScrollProgress] = useState(0)
    const [isDraggingWatchScroll, setIsDraggingWatchScroll] = useState(false)
    const [isVideoInView, setIsVideoInView] = useState(false)
    const [apiPosts, setApiPosts] = useState<CommunityPostData[]>([])
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
    const [commentModalPostId, setCommentModalPostId] = useState<string | null>(null)
    const [commentDraft, setCommentDraft] = useState('')
    const [commentError, setCommentError] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [likedByCardId, setLikedByCardId] = useState<Record<string, boolean>>({})
    const videoContainerRef = useRef<HTMLDivElement | null>(null)
    const nativeVideoRef = useRef<HTMLVideoElement | null>(null)
    const watchImageScrollRef = useRef<HTMLDivElement | null>(null)
    const watchScrollTrackRef = useRef<HTMLDivElement | null>(null)
    const readSectionTitleRef = useRef<HTMLHeadingElement | null>(null)
    const readSectionContentRef = useRef<HTMLDivElement | null>(null)
    const watchScrollProgressRef = useRef(0)
    const watchScrollRafRef = useRef<number | null>(null)

    const updateReadScrollHintVisibility = () => {
        const readSectionTitle = readSectionTitleRef.current
        const readSectionContent = readSectionContentRef.current
        if (!readSectionTitle || !readSectionContent) {
            setShowReadScroll(false)
            return
        }

        setReadSectionScrollTop(readSectionContent.scrollTop)

        const rect = readSectionTitle.getBoundingClientRect()
        const isTitleVisible = rect.top < window.innerHeight && rect.bottom > 0
        const reachedReadImage = readSectionContent.scrollTop > 24

        setShowReadScroll(isTitleVisible && !reachedReadImage)
    }

    const readImageRevealProgress = Math.min(1, Math.max(0, (readSectionScrollTop - 20) / 180))

    const setWatchScrollProgressSmooth = (progress: number, immediate = false) => {
        if (immediate) {
            if (watchScrollRafRef.current !== null) {
                window.cancelAnimationFrame(watchScrollRafRef.current)
                watchScrollRafRef.current = null
            }
            watchScrollProgressRef.current = progress
            setWatchScrollProgress(progress)
            return
        }

        watchScrollProgressRef.current = progress

        if (watchScrollRafRef.current !== null) return

        watchScrollRafRef.current = window.requestAnimationFrame(() => {
            watchScrollRafRef.current = null
            setWatchScrollProgress(watchScrollProgressRef.current)
        })
    }

    const displayCards = useMemo<CommunityCardItem[]>(() => {
        if (communityKey && apiPosts.length > 0) {
            return apiPosts.map(post => ({
                id: post.id,
                name: post.submission.student.name,
                className: '',
                school: post.submission.assignment.libraryItem.title,
                date: new Date(post.publishedAt).toLocaleDateString('vi-VN'),
                completed: post.submission.review?.resultStatus === 'PASSED',
                likedByMe: !!post.likedByMe,
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
        const onScroll = () => {
            setShowScroll(window.scrollY <= 100)
            updateReadScrollHintVisibility()
        }

        onScroll()
        window.addEventListener('scroll', onScroll)
        window.addEventListener('resize', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
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

    useEffect(() => {
        if (!displayCards.length) return
        setLikedByCardId((prev) => {
            const next = { ...prev }
            displayCards.forEach((card) => {
                if (typeof card.likedByMe === 'boolean') {
                    next[card.id] = card.likedByMe
                    return
                }
                if (!(card.id in next)) {
                    next[card.id] = false
                }
            })
            return next
        })
    }, [displayCards])

    const updateWatchScrollProgress = () => {
        const imageContainer = watchImageScrollRef.current
        if (!imageContainer) {
            setWatchScrollProgressSmooth(0, isDraggingWatchScroll)
            return
        }

        const maxScroll = imageContainer.scrollHeight - imageContainer.clientHeight
        if (maxScroll <= 0) {
            setWatchScrollProgressSmooth(0, isDraggingWatchScroll)
            return
        }

        setWatchScrollProgressSmooth(imageContainer.scrollTop / maxScroll, isDraggingWatchScroll)
    }

    const updateWatchScrollFromClientY = (clientY: number) => {
        const imageContainer = watchImageScrollRef.current
        const track = watchScrollTrackRef.current
        if (!imageContainer || !track) return

        const maxScroll = imageContainer.scrollHeight - imageContainer.clientHeight
        if (maxScroll <= 0) {
            setWatchScrollProgressSmooth(0, true)
            return
        }

        const rect = track.getBoundingClientRect()
        const progress = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))

        imageContainer.scrollTop = progress * maxScroll
        setWatchScrollProgressSmooth(progress, true)
    }

    const handleWatchScrollMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsDraggingWatchScroll(true)
        updateWatchScrollFromClientY(event.clientY)
    }

    useEffect(() => {
        updateWatchScrollProgress()
        window.addEventListener('resize', updateWatchScrollProgress)

        return () => {
            window.removeEventListener('resize', updateWatchScrollProgress)
        }
    }, [watchImageUrl])

    useEffect(() => {
        if (!isDraggingWatchScroll) return

        const handleMouseMove = (event: MouseEvent) => {
            updateWatchScrollFromClientY(event.clientY)
        }

        const handleMouseUp = () => {
            setIsDraggingWatchScroll(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDraggingWatchScroll])

    useEffect(() => {
        return () => {
            if (watchScrollRafRef.current !== null) {
                window.cancelAnimationFrame(watchScrollRafRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const target = videoContainerRef.current
        if (!target) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVideoInView(entry.isIntersecting)
            },
            { threshold: 0.45 }
        )

        observer.observe(target)
        return () => observer.disconnect()
    }, [videoUrl])

    useEffect(() => {
        const video = nativeVideoRef.current
        if (!video) return

        if (isVideoInView) {
            video.muted = false
            video.volume = 1
            video.play().catch(() => {
                // Fallback to muted autoplay if browser blocks sound autoplay.
                video.muted = true
                video.play().catch(() => {
                    // Ignore if autoplay is still blocked.
                })
            })
        } else {
            video.pause()
        }
    }, [isVideoInView, videoUrl])

    const selectedPost = useMemo(
        () => apiPosts.find(p => p.id === selectedPostId) ?? null,
        [apiPosts, selectedPostId]
    )
    const selectedCommentPost = useMemo(
        () => apiPosts.find(p => p.id === commentModalPostId) ?? null,
        [apiPosts, commentModalPostId]
    )
    const selectedCommentList = selectedCommentPost?.comments ?? []

    const handleCardClick = (cardId: string) => {
        if (!communityKey) return
        setSelectedPostId(cardId)
    }

    const handleCloseModal = () => setSelectedPostId(null)
    const handleOpenCommentModal = (cardId: string) => {
        if (!communityKey) return
        setCommentModalPostId(cardId)
        setCommentError('')
    }
    const handleCloseCommentModal = () => {
        setCommentModalPostId(null)
        setCommentDraft('')
        setCommentError('')
    }
    const toggleLike = async (cardId: string) => {
        const isCurrentlyLiked = !!likedByCardId[cardId]
        const nextLiked = !isCurrentlyLiked

        setLikedByCardId((prev) => ({ ...prev, [cardId]: nextLiked }))

        const hasApiPost = apiPosts.some((post) => post.id === cardId)
        if (!communityKey || !hasApiPost) return

        try {
            if (nextLiked) {
                await api.post(`/community/${communityKey}/posts/${cardId}/like`)
            } else {
                await api.delete(`/community/${communityKey}/posts/${cardId}/like`)
            }
        } catch {
            setLikedByCardId((prev) => ({ ...prev, [cardId]: isCurrentlyLiked }))
        }
    }

    const formatRoleLabel = (role: string) => (role === 'TEACHER' ? 'Giáo viên' : role === 'STUDENT' ? 'Học sinh' : role)

    const formatCommentTime = (isoTime: string) => (
        new Date(isoTime).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    )

    const handleSubmitComment = async () => {
        if (!communityKey || !commentModalPostId) return
        const content = commentDraft.trim()
        if (!content) {
            setCommentError('Vui lòng nhập bình luận.')
            return
        }
        try {
            setIsSubmittingComment(true)
            setCommentError('')
            const res = await api.post(`/community/${communityKey}/posts/${commentModalPostId}/comments`, { content })
            const createdComment = res.data?.data as CommunityPostCommentData | undefined
            if (!createdComment) {
                setCommentError('Không thể gửi bình luận. Vui lòng thử lại.')
                return
            }
            setApiPosts(prev => prev.map(post => (
                post.id === commentModalPostId
                    ? { ...post, comments: [createdComment, ...(post.comments || [])] }
                    : post
            )))
            setCommentDraft('')
        } catch (error: unknown) {
            const message = (typeof error === 'object' && error && 'response' in error)
                ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
                : undefined
            setCommentError(message || 'Không thể gửi bình luận. Vui lòng thử lại.')
        } finally {
            setIsSubmittingComment(false)
        }
    }

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
                                    className="w-full px-8 py-2 rounded-[35px] text-center h-[150px]"
                                    style={{
                                        color: '#303f86',
                                        backgroundColor: 'rgba(223, 250, 239, 0.6)',
                                        fontSize: '21px',
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
                        className="max-w-8xl mx-auto px-4 mb-[150px]"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-12 max-w-14xl mx-auto shadow-lg"
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
                                HÃY ĐẾN VỚI CHÚNG TÔI
                            </h2>

                            <div className="mb-16 last:mb-0">
                                {/* Layout */}
                                <div className="relative">
                                    <div className="flex gap-14 items-center">
                                        {/* Left side - VIDEO */}
                                        <div
                                            ref={videoContainerRef}
                                            className="flex-1 rounded-xl overflow-hidden"
                                            style={{
                                                backgroundColor: '#9FD9B5',
                                                height: '400px'
                                            }}
                                        >
                                            <video
                                                ref={nativeVideoRef}
                                                src={videoUrl}
                                                controls
                                                playsInline
                                                className="w-full h-full object-cover"
                                            >
                                                Trình duyệt của bạn không hỗ trợ phát video.
                                            </video>
                                        </div>

                                        {/* Right side - ẢNH (scrollable) */}
                                        <div
                                            ref={watchImageScrollRef}
                                            onScroll={updateWatchScrollProgress}
                                            className="flex-1 rounded-xl overflow-y-auto overflow-x-hidden"
                                            style={{
                                                backgroundColor: '#9FD9B5',
                                                height: '600px'
                                            }}
                                        >
                                            <div className="block">
                                                <img
                                                    src={watchImageUrl || 'https://via.placeholder.com/900x600?text=Anh+minh+hoa'}
                                                    alt="Ảnh minh họa"
                                                    onLoad={updateWatchScrollProgress}
                                                    className="w-full h-auto block"
                                                    draggable={false}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right scroll indicator */}
                                    <div
                                        className="absolute left-1/2 top-0 h-[600px] w-10 -translate-x-1/2 flex items-center justify-center cursor-pointer"
                                        onMouseDown={handleWatchScrollMouseDown}
                                    >
                                        <div
                                            ref={watchScrollTrackRef}
                                            className="relative h-full w-1"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <div
                                                className={`absolute left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${isDraggingWatchScroll ? 'transition-none cursor-grabbing' : 'transition-all duration-100 cursor-grab'}`}
                                                style={{
                                                    top: `${watchScrollProgress * 100}%`,
                                                    backgroundColor: '#64aab8',
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}



                {/* Gradient Transition */}
                <div style={{
                    background: `linear-gradient(to bottom, ${accentColor} 0%, ${secondaryColor} 100%)`,
                    height: '100px'
                }}></div>

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
                            TỪ TRANG SÁCH, EM CÓ THỂ…
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
                                            (() => {
                                                const isLiked = !!likedByCardId[card.id]
                                                const heartColor = isLiked ? '#ef4444' : primaryColor
                                                return (
                                                    <div
                                                        key={card.id}
                                                        className="relative h-full rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer"
                                                        style={{
                                                            backgroundColor: primaryColor,
                                                            padding: '2px'
                                                        }}
                                                        onClick={() => handleCardClick(card.id)}
                                                    >
                                                        {/* White spacing layer */}
                                                        <div className="bg-white rounded-3xl h-full" style={{ padding: '2.5px' }}>
                                                            {/* Inner card with gradient border effect */}
                                                            <div
                                                                className="relative rounded-3xl overflow-hidden h-full"
                                                                style={{
                                                                    background: `linear-gradient(to right, ${primaryColor} 0%, #d4f542 100%)`,
                                                                    padding: '2px'
                                                                }}
                                                            >
                                                                <div className="bg-white rounded-3xl p-4 relative h-full flex flex-col">

                                                                    {/* Top section with name, class, and school */}
                                                                    <div className="mb-3 text-center min-h-[100px]">
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
                                                                    <div className="flex-1 min-h-[120px] mb-4"></div>

                                                                    {/* Gradient divider line */}
                                                                    <div
                                                                        className=" h-[2px] w-full"
                                                                        style={{
                                                                            background: `linear-gradient(to right, ${primaryColor} 0%, #d4f542 100%)`
                                                                        }}
                                                                    ></div>

                                                                    {/* Bottom icons */}
                                                                    <div className="flex items-center justify-between">
                                                                        <button
                                                                            className="p-1"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                toggleLike(card.id)
                                                                            }}
                                                                            aria-label={isLiked ? 'Bỏ thích' : 'Thích'}
                                                                        >
                                                                            <svg className="w-6 h-6" fill={isLiked ? heartColor : 'none'} stroke="currentColor" viewBox="0 0 24 24" style={{ color: heartColor }}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            className="p-1"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                handleOpenCommentModal(card.id)
                                                                            }}
                                                                            aria-label="Bình luận"
                                                                        >
                                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })()
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

                {/* Gradient Transition */}
                <div style={{
                    background: `linear-gradient(to bottom, ${secondaryColor} 0%, ${accentColor} 100%)`,
                    height: '100px'
                }}></div>



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
                        <div className="max-w-[110%] mx-auto">
                            <div
                                ref={readSectionContentRef}
                                onScroll={updateReadScrollHintVisibility}
                                className="rounded-xl overflow-y-auto overflow-x-hidden p-3"
                                style={{
                                    backgroundColor: '#ffffff',
                                    height: '270px'
                                }}
                            >
                                <h2
                                    ref={readSectionTitleRef}
                                    className="text-[55px] font-bold text-center uppercase"
                                    style={{
                                        color: primaryColor,
                                        WebkitTextStroke: '3px white',
                                        paintOrder: 'stroke fill',
                                        textShadow: '0 0 10px rgba(255,255,255,0.5)'
                                    }}
                                >
                                    {readSectionTitle}
                                </h2>

                                <div className="mt-2 mb-4 h-[88px] flex items-center justify-center">
                                    <motion.div
                                        className="flex flex-col items-center"
                                        onClick={() => {
                                            if (showReadScroll) {
                                                window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
                                            }
                                        }}
                                        animate={{ opacity: showReadScroll ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ pointerEvents: showReadScroll ? 'auto' : 'none' }}
                                    >
                                        <motion.div
                                            className="relative mb-1"
                                            animate={{ y: [0, 7, 0] }}
                                            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            <ChevronDown className="w-9 h-9 text-[#303f86]" strokeWidth={3.5} />
                                            <ChevronDown className="w-9 h-9 text-[#303f86] absolute top-3 left-0" strokeWidth={3.5} />
                                        </motion.div>
                                        <p className="font-semibold text-[22px] text-[#303f86]">
                                            Cuộn xuống để tiếp tục đọc
                                        </p>
                                    </motion.div>
                                </div>

                                <div className="mt-8">
                                    {readSectionImageUrl ? (
                                        <motion.img
                                            key={readSectionImageUrl}
                                            src={readSectionImageUrl}
                                            alt={readSectionTitle}
                                            className="w-full h-auto block origin-top scale-124"
                                            animate={{
                                                opacity: readImageRevealProgress,
                                                y: (1 - readImageRevealProgress) * 24,
                                            }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                        />
                                    ) : (
                                        <p className="text-3xl font-semibold text-center py-8" style={{ color: primaryColor }}>
                                            ẢNH
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>


                {/* Gradient Transition */}
                <div style={{
                    background: `linear-gradient(to bottom, ${accentColor} 0%, ${secondaryColor} 100%)`,
                    height: '100px'
                }}></div>
            </div>


            {/* Comment Modal */}
            {commentModalPostId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={handleCloseCommentModal}
                >
                    <div
                        className="relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] mx-4 bg-white p-6 sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-[#1f3f8f] sm:text-3xl">Bình luận</h2>
                            <button
                                onClick={handleCloseCommentModal}
                                className="text-3xl font-bold text-[#1f3f8f] hover:opacity-70 ml-4 leading-none"
                                aria-label="Đóng bình luận"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedCommentList.length > 0 ? (
                                selectedCommentList.map((comment) => (
                                    <div key={comment.id} className="rounded-2xl border border-[#d8e9ff] bg-[#f8fbff] p-4">
                                        <p className="text-base font-bold text-[#1f3f8f]">
                                            {comment.user.name} - {formatRoleLabel(comment.user.role)}
                                        </p>
                                        <p className="mt-1 text-sm text-[#4b5f9e]">{formatCommentTime(comment.createdAt)}</p>
                                        <p className="mt-2 whitespace-pre-wrap break-words text-base text-[#1f3f8f]">{comment.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="rounded-2xl border border-dashed border-[#d8e9ff] bg-[#f8fbff] p-4 text-[#4b5f9e]">
                                    Chưa có bình luận nào.
                                </p>
                            )}
                        </div>

                        <div className="mt-6">
                            {user ? (
                                <>
                                    <textarea
                                        className="w-full min-h-[110px] rounded-2xl border border-[#c8dcff] p-3 text-[#1f3f8f] focus:outline-none focus:ring-2 focus:ring-[#6ea8ff]"
                                        placeholder="Nhập bình luận của bạn..."
                                        value={commentDraft}
                                        onChange={(e) => setCommentDraft(e.target.value)}
                                        maxLength={5000}
                                    />
                                    {commentError && (
                                        <p className="mt-2 text-sm font-medium text-red-600">{commentError}</p>
                                    )}
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSubmitComment}
                                            disabled={isSubmittingComment}
                                            className="rounded-xl bg-[#1f3f8f] px-5 py-2 font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="rounded-xl bg-[#fff8dd] px-4 py-3 text-[#7a6300]">
                                    Vui lòng đăng nhập để bình luận.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                                                                        {formatQuestionLabel(q.text, idx)} {q.options?.length ? '(câu trắc nghiệm)' : '(câu tự luận ngắn)'}
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
