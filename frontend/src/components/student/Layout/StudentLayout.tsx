import { ReactNode } from 'react'
import TopNavBar from '../../thu-vien-xanh/TopNavBar'

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
      <TopNavBar searchValue="" onSearchChange={() => undefined} onSearchSubmit={() => undefined} />
      <main className="min-h-[calc(100vh-80px)] bg-[#efeff1] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
