import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sage-50">
      <DashboardNav />
      {/* Offset for desktop sidebar (lg:ml-64) and mobile bottom nav (pb-20) */}
      <main className="lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
