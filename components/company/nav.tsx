'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  Calendar, 
  Inbox,
  Plus,
  Building2,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export function CompanyNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <Link href="/company" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-purple-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Company Portal
              </h1>
              <p className="text-xs text-gray-600 font-medium">Manage your job postings</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop Only */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="/company" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-indigo-100 rounded-lg transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
              <span>My Jobs</span>
            </Link>
            <Link 
              href="/company/responses" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-indigo-100 rounded-lg transition-colors">
                <Inbox className="w-4 h-4" />
              </div>
              <span>Responses</span>
            </Link>
            <Link 
              href="/company/bookings" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-indigo-100 rounded-lg transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Bookings</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu - Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/company/post-job">
                <Button className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Post Job
                </Button>
              </Link>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="transform hover:scale-105 transition-transform duration-200" suppressHydrationWarning>
                <UserButton />
              </div>
            </div>

            {/* Mobile User Button */}
            <div className="md:hidden" suppressHydrationWarning>
              <UserButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            <Link 
              href="/company"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-medium">My Jobs</span>
            </Link>
            <Link 
              href="/company/responses"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <Inbox className="w-5 h-5" />
              </div>
              <span className="font-medium">Responses</span>
            </Link>
            <Link 
              href="/company/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-medium">Bookings</span>
            </Link>
            <div className="px-4 pt-2">
              <Link href="/company/post-job">
                <Button className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
