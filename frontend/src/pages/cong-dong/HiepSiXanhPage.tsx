import { useEffect, useState } from 'react'
import CongDongTemplate, { LessonItem, CommunityCardItem } from './CongDongTemplate'
import hiepSiXanhImg from '../../img/1x/cong-dong-bg-hiep-si-xanh.svg'
import api from '../../api/axios'
import { CommunityPostResponse, formatDate } from './communityUtils'

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

export default function HiepSiXanhPage() {
    const [communityCards, setCommunityCards] = useState<CommunityCardItem[]>([])

    useEffect(() => {
        api.get('/community/hieu-si-xanh/posts', { params: { limit: 100 } })
            .then((res) => {
                const posts: CommunityPostResponse[] = res.data.data ?? []
                const cards: CommunityCardItem[] = posts.map((post) => ({
                    id: post.id,
                    name: post.submission.student.name,
                    className: post.submission.assignment.class.name,
                    school: post.submission.assignment.class.school,
                    date: formatDate(post.publishedAt),
                    completed: post.submission.review?.resultStatus === 'PASSED',
                }))
                setCommunityCards(cards)
            })
            .catch((err) => {
                console.error('Failed to load community posts:', err)
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
        />
    )
}
