export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center py-16 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#1f3f8f]" />
    </div>
  )
}
