'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname()
  
  // Exact match for the href
  // For root paths like /admin, /company, /freelancer - only match exactly
  const isActive = pathname === href

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
        isActive 
          ? 'bg-gray-200 text-gray-900 font-medium' 
          : 'text-gray-700 hover:bg-gray-100',
        className
      )}
    >
      {children}
    </Link>
  )
}

