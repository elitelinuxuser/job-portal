import { requireRole } from '@/lib/auth'
import { UserButton } from '@clerk/nextjs'
import { NavLink } from '@/components/nav-link'
import { 
  Briefcase, 
  Inbox,
  Calendar
} from 'lucide-react'

export default async function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('freelancer')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold">Freelancer</h1>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink href="/freelancer">
            <Briefcase className="w-5 h-5" />
            <span>Browse Jobs</span>
          </NavLink>
          <NavLink href="/freelancer/bookings">
            <Calendar className="w-5 h-5" />
            <span>My Bookings</span>
          </NavLink>
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



