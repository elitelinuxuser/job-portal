import { requireRole } from '@/lib/auth'
import { UserButton } from '@clerk/nextjs'
import { NavLink } from '@/components/nav-link'
import { MobileNav } from '@/components/mobile-nav'
import { 
  Briefcase, 
  Plus, 
  Inbox, 
  Calendar 
} from 'lucide-react'

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('company')

  const navItems = [
    { href: '/company', icon: <Briefcase className="w-5 h-5" />, label: 'My Jobs' },
    { href: '/company/post-job', icon: <Plus className="w-5 h-5" />, label: 'Post Job' },
    { href: '/company/responses', icon: <Inbox className="w-5 h-5" />, label: 'Responses' },
    { href: '/company/bookings', icon: <Calendar className="w-5 h-5" />, label: 'Bookings' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNav title="Company Portal" navItems={navItems} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Company Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Freelancer Platform</h2>
          <UserButton afterSignOutUrl="/sign-in" />
        </header>

        {/* Content - Add top padding on mobile to account for fixed header */}
        <main className="flex-1 overflow-y-auto p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}



