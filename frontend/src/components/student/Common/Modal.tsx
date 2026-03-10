import { ReactNode, useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ open, onClose, children, title, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])
  
  if (!open) return null
  
  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`w-full ${maxWidthClasses[maxWidth]} rounded-[34px] border-2 border-[#8bee9f] 
          bg-gradient-to-b from-white to-[#dff2ea] p-8 
          shadow-[0_0_0_2px_rgba(63,98,170,0.7)]`}
      >
        {title && (
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#1f3f8f] text-center mb-6">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
