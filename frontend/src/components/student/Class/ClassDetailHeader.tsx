import { ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'

interface TabItem {
  key: string
  label: string
  icon: ReactNode
}

interface ClassDetailHeaderProps {
  classLabel: string
  schoolLabel: string
  classCode: string
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabKey: string) => void
}

export default function ClassDetailHeader({
  classLabel,
  schoolLabel,
  classCode,
  tabs,
  activeTab,
  onTabChange,
}: ClassDetailHeaderProps) {
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null)
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div
            className="flex h-[40px] w-[260px] items-center rounded-full border-2 border-transparent px-2"
            style={{
              background:
                'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
            }}
          >
            <span className="flex h-[30px] items-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 text-[14px] font-black uppercase text-white">
              Lớp
            </span>
            <span className="ml-4 text-[20px] font-extrabold text-[#1f3f8f]">{classLabel}</span>
          </div>

          <div
            className="flex h-[40px] w-[520px] items-center rounded-full border-2 border-transparent px-2"
            style={{
              background:
                'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
            }}
          >
            <span className="flex h-[30px] items-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 text-[14px] font-black uppercase text-white">
              Trường
            </span>
            <span className="ml-4 text-[20px] font-extrabold text-[#1f3f8f]">{schoolLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#1f3f8f]">
          {tabs.map((item, index) => {
            const isActive = activeTab === item.key

            return (
              <div key={item.key} className="relative flex items-center gap-1">
                <button
                  onClick={() => onTabChange(item.key)}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    setTooltip({ label: item.label, x: rect.left + rect.width / 2, y: rect.top })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className={`group p-1 sm:p-2 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={item.label}
                >
                  <span className="text-[#1f3f8f] [&_svg]:h-8 [&_svg]:w-8 sm:[&_svg]:h-9 sm:[&_svg]:w-9">
                    {item.icon}
                  </span>
                </button>

                {index !== tabs.length - 1 && <div className="h-6 w-[2px] bg-[#1f3f8f] opacity-60 sm:h-8" />}
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="flex h-[40px] w-[260px] items-center rounded-full border-2 border-transparent px-2"
        style={{
          background:
            'linear-gradient(#f3fffb, #f3fffb) padding-box, linear-gradient(90deg, #3f72be 0%, #8de8a1 100%) border-box',
        }}
      >
        <span className="flex h-[30px] items-center rounded-full bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] px-4 text-[14px] font-black uppercase text-white">
          Mã
        </span>
        <span className="ml-4 text-[20px] font-extrabold uppercase text-[#1f3f8f]">{classCode}</span>
      </div>
      {tooltip &&
        createPortal(
          <div
            className="pointer-events-none z-[9999] rounded-full border border-[#9dc7de] bg-[#f4f8fc] px-4 py-1.5 text-sm font-extrabold text-[#1f3f8f] shadow-[0_2px_8px_rgba(31,63,143,0.18)]"
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltip.label}
            <span className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-[#9dc7de] bg-[#f4f8fc]" />
          </div>,
          document.body
        )}
    </>
  )
}
