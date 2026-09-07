import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileQuickNav from '@/components/layout/MobileQuickNav'
import GlobalSearch from '@/components/layout/GlobalSearch'
import SiteAnnouncement from '@/components/layout/SiteAnnouncement'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <SiteAnnouncement />
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">{children}</div>
      <Footer />
      <MobileQuickNav />
      <GlobalSearch />
    </>
  )
}
