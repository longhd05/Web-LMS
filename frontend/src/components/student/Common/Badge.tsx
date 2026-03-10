import { ReactNode } from 'react'

type BadgeVariant = 'success' | 'pending' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
  className?: string
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    warning: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-sky-100 text-sky-700 border-sky-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200'
  }
  
  return (
    <span 
      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
