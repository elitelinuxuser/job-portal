import { requireRole } from '@/lib/auth'
import { CompanyNav } from '@/components/company/nav'
import { getUnreadResponsesCount } from '@/lib/actions/jobs'

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('company')
  const unreadCount = await getUnreadResponsesCount()

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNav unreadResponsesCount={unreadCount} />
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
