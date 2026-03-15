import { useEffect, useState } from 'react'
import api from '../../api/axios'
import CongDongTemplate, { CommunityCardItem, LessonItem } from './CongDongTemplate'
import hiepSiXanhImg from '../../img/1x/cong-dong-bg-hiep-si-xanh.svg'

const lessons: LessonItem[] = [
    {
        id: 'lesson-1',
        title: 'Tên bài học',
        description: 'Mô tả ngắn về bài học và nội dung chính',
        imageUrl: undefined,
    },
    {
        id: 'lesson-2',
        title: 'Tên bài học',
        description: 'Mô tả ngắn về bài học và nội dung chính',
        imageUrl: undefined,
    },
    {
        id: 'lesson-3',
        title: 'Tên bài học',
        description: 'Mô tả ngắn về bài học và nội dung chính',
        imageUrl: undefined,
    },
]

interface CommunityPost {
    id: string
    publishedAt: string
    submission: {
        student: { id: string; name: string }
        assignment: {
            class: { id: string; name: string }
        }
        review?: { resultStatus: string } | null
    }
}

function formatDate(iso: string): string {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

export default function HiepSiXanhPage() {
    const [communityCards, setCommunityCards] = useState<CommunityCardItem[]>([])

    useEffect(() => {
        api.get('/community/hieu-si-xanh/posts', { params: { limit: 100 } })
            .then((res) => {
                const posts: CommunityPost[] = res.data.data ?? []
                const cards: CommunityCardItem[] = posts.map((post) => ({
                    id: post.id,
                    name: post.submission.student.name.toUpperCase(),
                    className: post.submission.assignment.class.name,
                    date: formatDate(post.publishedAt),
                    completed: post.submission.review?.resultStatus === 'PASSED',
                }))
                setCommunityCards(cards)
            })
            .catch(() => {
                setCommunityCards([])
            })
    }, [])

    return (
        <CongDongTemplate
            title="HIỆP SĨ XANH"
            subtitle="Tiêu chí, giới thiệu về cộng đồng hiệp sĩ xanh"
            backgroundImage={hiepSiXanhImg}
            backgroundSize="115%"
            backgroundSizeMobile="200%"
            backgroundPaddingTop="50px"
            subtitleBoxBottom="80px"
            primaryColor="#1e3a8a"
            secondaryColor="#a9f9d1"
            accentColor="#baedb3"
            videoUrl="https://example.com/video"
            lessons={lessons}
            communityCards={communityCards}
            communityKey="hieu-si-xanh"
        />
    )
}
