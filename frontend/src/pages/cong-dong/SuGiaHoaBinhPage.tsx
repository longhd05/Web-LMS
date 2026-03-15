import { useEffect, useState } from 'react'
import api from '../../api/axios'
import CongDongTemplate, { CommunityCardItem, LessonItem } from './CongDongTemplate'
import suGiaHoaBinhImg from '../../img/1x/cong-dong-bg-su-gia-hoa-binh.svg'

const lessons: LessonItem[] = [
    {
        id: 'lesson-1',
        title: 'Tên bài học',
        description: 'Mô tả ngắn về bài học hòa bình và hòa giải',
        imageUrl: undefined,
    },
    {
        id: 'lesson-2',
        title: 'Tên bài học',
        description: 'Mô tả ngắn về bài học hòa bình và hòa giải',
        imageUrl: undefined,
    },
    {
        id: 'lesson-3',
        title: 'Tên bài học',
        description: 'Mô tả ngắn về bài học hòa bình và hòa giải',
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

export default function SuGiaHoaBinhPage() {
    const [communityCards, setCommunityCards] = useState<CommunityCardItem[]>([])

    useEffect(() => {
        api.get('/community/su-gia-hoa-binh/posts', { params: { limit: 100 } })
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
            title="SỨ GIẢ HÒA BÌNH & HÒA GIẢI"
            subtitle="Tiêu chí, giới thiệu về cộng đồng sứ giả hòa bình"
            backgroundImage={suGiaHoaBinhImg}
            backgroundSize="90%"
            backgroundSizeMobile="220%"
            backgroundPosition="center 0%"
            backgroundPaddingTop="100px"
            subtitleBoxBottom="50px"
            primaryColor="#1e3a8a"
            secondaryColor="#b7e9e5"
            accentColor="#caf2e7"
            videoUrl="https://example.com/video"
            lessons={lessons}
            communityCards={communityCards}
        />
    )
}
