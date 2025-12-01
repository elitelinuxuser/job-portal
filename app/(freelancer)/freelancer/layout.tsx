import { requireRole } from '@/lib/auth'
import { FreelancerNav } from '@/components/freelancer/nav'

export default async function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('freelancer')

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <FreelancerNav />
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
