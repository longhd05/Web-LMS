import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  children,
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: `rounded-[22px] border-2 border-[#1f3f8f] 
      bg-gradient-to-b from-[#1f3f8f] to-[#149fb3] 
      text-white shadow-[inset_0_0_0_1px_rgba(49,184,202,0.9)]
      hover:-translate-y-0.5 hover:shadow-[0_8px_14px_rgba(31,63,143,0.25)]
      active:translate-y-0 active:scale-[0.98]`,
    secondary: `rounded-full border-2 border-[#7aa3df] 
      bg-white text-[#1f3f8f]
      hover:bg-[#eef5ff] hover:-translate-y-0.5`,
    ghost: `rounded-full text-[#1f3f8f] 
      hover:bg-[#eef5ff]`,
    danger: `rounded-[22px] border-2 border-red-500 
      bg-gradient-to-b from-red-500 to-red-600 
      text-white shadow-[inset_0_0_0_1px_rgba(255,100,100,0.5)]
      hover:-translate-y-0.5`
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-base',
    md: 'px-5 py-2.5 text-lg',
    lg: 'px-6 py-3 text-xl'
  }
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
