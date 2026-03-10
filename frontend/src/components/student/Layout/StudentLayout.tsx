import { ReactNode } from 'react'
import StudentTopNavBar from './StudentTopNavBar'

const thuVienXanhBackground = new URL('../../../img/1x/hinh-nen.png', import.meta.url).href

interface StudentLayoutProps {
  children: ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div 
      className="min-h-screen bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${thuVienXanhBackground})` }}
    >
      <StudentTopNavBar />
      <main className="min-h-[calc(100vh-64px)] bg-[#efeff1] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
