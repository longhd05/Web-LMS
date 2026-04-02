import { useEffect, useState } from 'react'
import api from '../../api/axios'
import CongDongTemplate, { CommunityCardItem } from './CongDongTemplate'
import hiepSiXanhImg from '../../img/1x/cong-dong-bg-hiep-si-xanh.svg'
import hiepSiXanhCanhVideoImg from '../../img/1x/hiep-si-xanh-canh-video.png'
import congDongHiepSiXanhImg from '../../img/1x/Cong-dong-hiep-si-xanh.png'

const HIEP_SI_XANH_VIDEO_URL = 'https://res.cloudinary.com/dsq2xzxur/video/upload/v1775127372/IMG_4691_qptgt9.mp4'

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
            subtitle={
                <>
                    Chào mừng em đến với cộng đồng{' '}
                    <span style={{ fontStyle: 'italic', fontWeight: 700 }}>
                        Hiệp sĩ Xanh
                    </span>
                    {' '}– nơi những người trẻ cùng chung tay bảo vệ môi trường và hướng tới một tương lai phát triển bền vững của thế giới. Tại đây, em sẽ khám phá những câu chuyện, bài học về mối quan hệ giữa con người và thiên nhiên, từ đó nhận ra những vấn đề môi trường trong cuộc sống và học cách hành động có trách nhiệm, góp phần gìn giữ một thế giới xanh.
                </>
            }
            backgroundImage={hiepSiXanhImg}
            backgroundSize="115%"
            backgroundSizeMobile="200%"
            backgroundPaddingTop="50px"
            subtitleBoxBottom="80px"
            primaryColor="#1e3a8a"
            secondaryColor="#a9f9d1"
            accentColor="#baedb3"
            readSectionTitle="NHỮNG HIỆP SĨ XANH TRÊN THẾ GIỚI"
            readSectionImageUrl={congDongHiepSiXanhImg}
            videoUrl={HIEP_SI_XANH_VIDEO_URL}
            watchImageUrl={hiepSiXanhCanhVideoImg}
            communityCards={communityCards}
            communityKey="hieu-si-xanh"
        />
    )
}
