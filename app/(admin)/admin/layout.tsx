import { requireRole } from '@/lib/auth'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  BarChart3 
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('admin')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/invites"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Invites</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
          <Link
            href="/admin/metrics"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Metrics</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold">Freelancer Platform</h2>
          <UserButton afterSignOutUrl="/sign-in" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

