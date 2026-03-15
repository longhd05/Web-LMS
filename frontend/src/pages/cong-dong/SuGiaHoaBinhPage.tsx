import { useEffect, useState } from 'react'
import CongDongTemplate, { LessonItem, CommunityCardItem } from './CongDongTemplate'
import suGiaHoaBinhImg from '../../img/1x/cong-dong-bg-su-gia-hoa-binh.svg'
import api from '../../api/axios'
import { CommunityPostResponse, formatDate } from './communityUtils'

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

export default function SuGiaHoaBinhPage() {
    const [communityCards, setCommunityCards] = useState<CommunityCardItem[]>([])

    useEffect(() => {
        api.get('/community/su-gia-hoa-binh/posts', { params: { limit: 100 } })
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
