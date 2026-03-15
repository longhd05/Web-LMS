import { Link } from 'react-router-dom'

interface CommunityShortcutGridProps {
  suGiaHoaBinhImg: string
  hiepSiXanhImg: string
}

export default function CommunityShortcutGrid({
  suGiaHoaBinhImg,
  hiepSiXanhImg,
}: CommunityShortcutGridProps) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-10 px-64 md:grid-cols-2 md:gap-14">
      <div className="flex items-center justify-center">
        <Link to="/cong-dong/su-gia-hoa-binh">
          <img src={suGiaHoaBinhImg} alt="Sư giả hòa bình" className="h-[350px] w-[350px] object-contain" />
        </Link>
      </div>

      <div className="flex items-center justify-center">
        <Link to="/cong-dong/hiep-si-xanh">
          <img src={hiepSiXanhImg} alt="Hiệp sĩ xanh" className="h-[370px] w-[370px] object-contain" />
        </Link>
      </div>
    </div>
  )
}
