import { useEffect, useState } from 'react'
import api from '../../api/axios'
import CongDongTemplate, { CommunityCardItem } from './CongDongTemplate'
import suGiaHoaBinhImg from '../../img/1x/cong-dong-bg-su-gia-hoa-binh.svg'
import suGiaHoaBinhCanhVideoImg from '../../img/1x/su-gia-hoa-binh-canh-video.png'
import congsuGiaHoaBinhImg from '../../img/1x/Cong-dong-su-gia-hoa-binh.png'

const SU_GIA_HOA_BINH_VIDEO_URL = 'https://res.cloudinary.com/dsq2xzxur/video/upload/v1775127386/IMG_4690_hhab9x.mp4'

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
            subtitle={
                <>
                    Chào mừng em đến với cộng đồng{' '}
                    <span style={{ fontStyle: 'italic', fontWeight: 700 }}>
                        Sứ giả Hòa bình và Hòa giải
                    </span>
                    {' '}– nơi những người trẻ cùng học cách thấu hiểu, tôn trọng sự khác biệt và hướng tới giải quyết xung đột một cách văn minh. Tại đây, em sẽ khám phá những câu chuyện, bài học về hòa bình và cách con người ứng xử trước mâu thuẫn, từ đó học được cách lắng nghe, đối thoại và hành động có trách nhiệm, góp phần xây dựng một xã hội an toàn, bình yên trong tương lai.
                </>
            } backgroundImage={suGiaHoaBinhImg}
            backgroundSize="90%"
            backgroundSizeMobile="220%"
            backgroundPosition="center 0%"
            backgroundPaddingTop="100px"
            subtitleBoxBottom="23px"
            primaryColor="#1e3a8a"
            secondaryColor="#b7e9e5"
            accentColor="#caf2e7"
            readSectionTitle="NHỮNG SỨ GIẢ HÒA BÌNH VÀ HÒA GIẢI TRÊN THẾ GIỚI"
            readSectionLayout="single-image"
            readSectionImageUrl={congsuGiaHoaBinhImg}
            videoUrl={SU_GIA_HOA_BINH_VIDEO_URL}
            watchImageUrl={suGiaHoaBinhCanhVideoImg}
            communityCards={communityCards}
            communityKey="su-gia-hoa-binh"
        />
    )
}
