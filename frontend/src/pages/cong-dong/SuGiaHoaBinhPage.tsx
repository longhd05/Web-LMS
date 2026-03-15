import CongDongTemplate, { LessonItem, CommunityCardItem } from './CongDongTemplate'
import suGiaHoaBinhImg from '../../img/1x/cong-dong-bg-su-gia-hoa-binh.svg'

const lessons: LessonItem[] = [
    {
        id: 'lesson-1',
        title: 'Tên bài học',
        description: 'Mô tả ngắn về bài học hòa bình và hòa giải',
        imageUrl: undefined, // Có thể thêm URL ảnh ở đây
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

const communityCards: CommunityCardItem[] = [
    {
        id: 'card-1',
        name: 'NGUYỄN VĂN A',
        className: '11A',
        school: 'TRƯỜNG THCS ABC',
        date: '15/03/2026',
        completed: true,
    },
    {
        id: 'card-2',
        name: 'NGUYỄN VĂN B',
        className: '10A',
        school: 'TRƯỜNG THCS ABC',
        date: '14/03/2026',
        completed: true,
    },
    {
        id: 'card-3',
        name: 'TRẦN THỊ C',
        className: '12B',
        school: 'TRƯỜNG THCS ABC',
        date: '13/03/2026',
        completed: false,
    },
    {
        id: 'card-4',
        name: 'LÊ VĂN D',
        className: '11C',
        school: 'TRƯỜNG THCS ABC',
        date: '12/03/2026',
        completed: true,
    },
    {
        id: 'card-5',
        name: 'PHẠM THỊ E',
        className: '10D',
        school: 'TRƯỜNG THCS ABC',
        date: '11/03/2026',
        completed: false,
    },
    {
        id: 'card-6',
        name: 'HOÀNG VĂN F',
        className: '12A',
        school: 'TRƯỜNG THCS ABC',
        date: '10/03/2026',
        completed: true,
    },
    {
        id: 'card-7',
        name: 'NGUYỄN THỊ G',
        className: '11B',
        school: 'TRƯỜNG THCS ABC',
        date: '09/03/2026',
        completed: false,
    },
    {
        id: 'card-8',
        name: 'TRẦN VĂN H',
        className: '10E',
        school: 'TRƯỜNG THCS ABC',
        date: '08/03/2026',
        completed: true,
    },
    {
        id: 'card-9',
        name: 'LÊ THỊ I',
        className: '10A',
        school: 'TRƯỜNG THCS ABC',
        date: '07/03/2026',
        completed: true,
    },
    {
        id: 'card-10',
        name: 'VÕ VĂN K',
        className: '11D',
        school: 'TRƯỜNG THCS ABC',
        date: '06/03/2026',
        completed: false,
    },
    {
        id: 'card-11',
        name: 'BÙI THỊ L',
        className: '12C',
        school: 'TRƯỜNG THCS ABC',
        date: '05/03/2026',
        completed: true,
    },
    {
        id: 'card-12',
        name: 'ĐỖ VĂN M',
        className: '10B',
        school: 'TRƯỜNG THCS ABC',
        date: '04/03/2026',
        completed: true,
    },
    {
        id: 'card-13',
        name: 'HỒ THỊ N',
        className: '11A',
        school: 'TRƯỜNG THCS ABC',
        date: '03/03/2026',
        completed: false,
    },
    {
        id: 'card-14',
        name: 'DƯƠNG VĂN O',
        className: '12D',
        school: 'TRƯỜNG THCS ABC',
        date: '02/03/2026',
        completed: true,
    },
    {
        id: 'card-15',
        name: 'LÝ THỊ P',
        className: '10C',
        school: 'TRƯỜNG THCS ABC',
        date: '01/03/2026',
        completed: false,
    },
    {
        id: 'card-16',
        name: 'NGUYỄN VĂN Q',
        className: '11E',
        school: 'TRƯỜNG THCS ABC',
        date: '28/02/2026',
        completed: true,
    },
]

export default function SuGiaHoaBinhPage() {
    return (
        <CongDongTemplate
            title="SỨ GIẢ HÒA BÌNH & HÒA GIẢI"
            subtitle="Tiêu chí, giới thiệu về cộng đồng sứ giả hòa bình"
            backgroundImage={suGiaHoaBinhImg}
            backgroundSize="90%" // Tùy chỉnh theo page này - ví dụ lớn hơn một chút
            backgroundSizeMobile="220%" // Tùy chỉnh cho mobile
            backgroundPosition="center 0%" // Kéo background xuống một chút (60% từ trên xuống)
            backgroundPaddingTop="100px" // Thêm khoảng cách trên cho background
            subtitleBoxBottom="50px"
            primaryColor="#1e3a8a" // Navy blue
            secondaryColor="#b7e9e5" // Light cyan/blue
            accentColor="#caf2e7" // Sky blue
            videoUrl="https://example.com/video" // URL video nếu có
            lessons={lessons}
            communityCards={communityCards}
            communityKey="su-gia-hoa-binh"
        />
    )
}
