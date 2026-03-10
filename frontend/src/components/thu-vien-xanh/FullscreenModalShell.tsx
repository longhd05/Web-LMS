import { useCallback, useEffect, useRef, useState } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'

interface FullscreenModalShellProps {
  titleLeft: string
  titleRight: string
  dirty: boolean
  onClose: () => void
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
}

function ScrollPanel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [thumbTop, setThumbTop] = useState(0)
  const [isScrollable, setIsScrollable] = useState(false)

  const thumbSize = 24

  const syncThumbWithScroll = useCallback(() => {
    const scrollEl = scrollRef.current
    const trackEl = trackRef.current
    if (!scrollEl || !trackEl) return

    const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight
    const maxThumbTop = Math.max(trackEl.clientHeight - thumbSize, 0)

    if (maxScrollTop <= 0 || maxThumbTop <= 0) {
      setIsScrollable(false)
      setThumbTop(0)
      return
    }

    setIsScrollable(true)
    const nextThumbTop = (scrollEl.scrollTop / maxScrollTop) * maxThumbTop
    setThumbTop(nextThumbTop)
  }, [])

  useEffect(() => {
    syncThumbWithScroll()
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const onScroll = () => syncThumbWithScroll()
    const onResize = () => syncThumbWithScroll()

    scrollEl.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)

    const resizeObserver = new ResizeObserver(() => syncThumbWithScroll())
    resizeObserver.observe(scrollEl)

    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      resizeObserver.disconnect()
    }
  }, [syncThumbWithScroll, children])

  const updateScrollByThumb = (nextThumbTop: number) => {
    const scrollEl = scrollRef.current
    const trackEl = trackRef.current
    if (!scrollEl || !trackEl) return

    const maxScrollTop = Math.max(scrollEl.scrollHeight - scrollEl.clientHeight, 0)
    const maxThumbTop = Math.max(trackEl.clientHeight - thumbSize, 0)
    const clamped = Math.min(Math.max(nextThumbTop, 0), maxThumbTop)

    setThumbTop(clamped)
    if (maxThumbTop === 0) {
      scrollEl.scrollTop = 0
      return
    }
    scrollEl.scrollTop = (clamped / maxThumbTop) * maxScrollTop
  }

  const handleThumbMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    const trackEl = trackRef.current
    if (!trackEl) return

    const startY = event.clientY
    const startTop = thumbTop

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY
      updateScrollByThumb(startTop + deltaY)
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const handleTrackMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const trackEl = trackRef.current
    if (!trackEl) return
    const rect = trackEl.getBoundingClientRect()
    const nextThumbTop = event.clientY - rect.top - thumbSize / 2
    updateScrollByThumb(nextThumbTop)
  }

  return (
    <div className="relative min-h-0 rounded-3xl bg-cyan-50 border border-cyan-200">
      <div ref={scrollRef} className="h-full min-h-0 p-4 sm:p-5 pr-12 overflow-y-auto tvx-scroll-hidden">
        {children}
      </div>

      <div
        ref={trackRef}
        onMouseDown={handleTrackMouseDown}
        className={`absolute top-5 bottom-5 right-3 w-2 rounded-full bg-sky-200 ${
          isScrollable ? 'cursor-pointer' : 'opacity-50'
        }`}
      >
        <button
          type="button"
          aria-label="Scrollbar thumb"
          onMouseDown={handleThumbMouseDown}
          disabled={!isScrollable}
          className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-teal-600 border-2 border-sky-100 shadow-sm disabled:cursor-not-allowed"
          style={{ top: `${thumbTop}px` }}
        />
      </div>
    </div>
  )
}

export default function FullscreenModalShell({
  titleLeft,
  titleRight,
  dirty,
  onClose,
  leftPanel,
  rightPanel,
}: FullscreenModalShellProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const requestClose = useCallback(() => {
    if (dirty) {
      setIsConfirmOpen(true)
      return
    }
    onClose()
  }, [dirty, onClose])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (isConfirmOpen) {
          setIsConfirmOpen(false)
          return
        }
        requestClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isConfirmOpen, requestClose])

  return (
    <div className="min-h-[calc(100vh-80px)] bg-transparent">
      <div className="h-[calc(100vh-80px)] flex flex-col">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <button
            onClick={requestClose}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 text-blue-900 px-4 py-2 font-semibold border border-cyan-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Quay lại
          </button>

          <button
            type="button"
            aria-label="Đóng"
            onClick={requestClose}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-blue-900 font-bold border border-cyan-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-6 flex-1 min-h-0">
          <div className="h-full bg-white/80 border border-cyan-200 rounded-[28px] p-4 sm:p-6 flex flex-col min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-cyan-200">
              <h2 className="font-extrabold text-blue-950 text-lg sm:text-xl truncate">{titleLeft}</h2>
              <h3 className="font-black text-blue-900 text-lg sm:text-xl uppercase md:text-right">{titleRight}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 flex-1 min-h-0">
              <ScrollPanel>
                {leftPanel}
              </ScrollPanel>

              <ScrollPanel>
                {rightPanel}
              </ScrollPanel>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Thoát mà chưa lưu"
        message="Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát không?"
        confirmText="Thoát"
        cancelText="Ở lại"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false)
          onClose()
        }}
      />
    </div>
  )
}
