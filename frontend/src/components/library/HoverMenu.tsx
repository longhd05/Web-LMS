import { useEffect, useState } from 'react'

interface HoverMenuProps {
  actions: Array<{ id: string; label: string }>
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  onSelect: (actionId: string) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function HoverMenu({
  actions,
  open,
  anchorEl,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: HoverMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open || !anchorEl) return

    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4, // 👈 BỎ window.scrollY - fixed position tự tính từ viewport
        left: rect.left,      // 👈 BỎ window.scrollX
      })
    }

    updatePosition()

    // Cập nhật khi scroll hoặc resize
    const handleScroll = () => updatePosition()
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, anchorEl])

  if (!open || actions.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="min-w-[140px]"
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {actions.map((action) => (
          <button
            key={action.id}
            role="menuitem"
            onClick={() => onSelect(action.id)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
          >
            {action.id === 'reading' && <span>📖</span>}
            {action.id === 'integrated' && <span>🔗</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}