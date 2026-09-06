import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SubscribeButton from '@/components/notifications/SubscribeButton'
import MobileQuickNav from '@/components/layout/MobileQuickNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileQuickNav />
      {/* Floating "Get Alerts" button — mobile only, hides once subscribed */}
      <SubscribeButton variant="float" />
    </>
  )
}
