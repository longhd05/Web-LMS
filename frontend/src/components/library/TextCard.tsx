import { useState, useRef, useEffect } from 'react'
import { TextItem } from '../../types/libraryShelf'
import HoverMenu from './HoverMenu'
import ReadingComprehensionModal from './ReadingComprehensionModal'
import IntegratedTaskModal from './IntegratedTaskModal'

interface TextCardProps {
  text: TextItem
  onAction: (textId: string, action: 'reading' | 'integrated') => void
}

const bookColors = [
  { bg: 'from-blue-500 to-blue-600', spine: 'bg-blue-700' },
  { bg: 'from-green-500 to-green-600', spine: 'bg-green-700' },
  { bg: 'from-purple-500 to-purple-600', spine: 'bg-purple-700' },
  { bg: 'from-red-500 to-red-600', spine: 'bg-red-700' },
  { bg: 'from-indigo-500 to-indigo-600', spine: 'bg-indigo-700' },
  { bg: 'from-pink-500 to-pink-600', spine: 'bg-pink-700' },
  { bg: 'from-teal-500 to-teal-600', spine: 'bg-teal-700' },
  { bg: 'from-orange-500 to-orange-600', spine: 'bg-orange-700' },
  { bg: 'from-cyan-500 to-cyan-600', spine: 'bg-cyan-700' },
  { bg: 'from-amber-500 to-amber-600', spine: 'bg-amber-700' },
]

export default function TextCard({ text, onAction }: TextCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showReadingModal, setShowReadingModal] = useState(false)
  const [showIntegratedModal, setShowIntegratedModal] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  const colorIndex = text.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bookColors.length
  const bookColor = bookColors[colorIndex]

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setMenuOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const actions = []
  if (text.hasReadingQuiz) {
    actions.push({ id: 'reading', label: 'Đọc hiểu' })
  }
  if (text.hasIntegratedTask) {
    actions.push({ id: 'integrated', label: 'Tích hợp' })
  }

  const handleSelectAction = (actionId: string) => {
    if (actionId === 'reading') {
      setShowReadingModal(true)
    } else if (actionId === 'integrated') {
      setShowIntegratedModal(true)
    }
    setMenuOpen(false)
  }

  return (
    <>
      <div
        ref={cardRef}
        className="relative flex-shrink-0 group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`
            bg-gradient-to-br ${bookColor.bg}
            rounded-t-lg
            h-56 w-36
            flex flex-col
            shadow-lg
            cursor-pointer
            relative
            hover:shadow-xl
            transition-shadow
            overflow-hidden
          `}
          onClick={() => {
            if (text.hasReadingQuiz) {
              setShowReadingModal(true)
            } else if (text.hasIntegratedTask) {
              setShowIntegratedModal(true)
            }
          }}
        >
          {text.coverUrl ? (
            <img
              src={text.coverUrl}
              alt={text.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-white relative z-10">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-sm font-bold text-center leading-tight line-clamp-3 mb-2">
                {text.title}
              </p>
              <p className="text-xs opacity-80 text-center">{text.type}</p>
              {text.difficulty && (
                <span className="mt-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {text.difficulty}
                </span>
              )}
            </div>
          )}

          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg"></div>
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-black/20 to-transparent"></div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${bookColor.spine}`}></div>
        </div>

        {menuOpen && actions.length > 0 && (
          <HoverMenu
            actions={actions}
            open={menuOpen}
            anchorEl={cardRef.current}
            onClose={() => setMenuOpen(false)}
            onSelect={handleSelectAction}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </div>

      {/* Reading Comprehension Modal */}
      <ReadingComprehensionModal
        isOpen={showReadingModal}
        onClose={() => setShowReadingModal(false)}
        textId={text.id}
      />

      {/* Integrated Task Modal */}
      <IntegratedTaskModal
        isOpen={showIntegratedModal}
        onClose={() => setShowIntegratedModal(false)}
        textId={text.id}
      />
    </>
  )
}