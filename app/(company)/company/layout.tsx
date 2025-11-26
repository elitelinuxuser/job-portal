import { requireRole } from '@/lib/auth'
import { CompanyNav } from '@/components/company/nav'

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('company')

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyNav />
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
