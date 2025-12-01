'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { 
  Briefcase, 
  Calendar, 
  Search,
  Menu,
  X,
  FileText,
  IndianRupee
} from 'lucide-react'
import { useState } from 'react'

export function FreelancerNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <Link href="/freelancer" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                CreativeGigs
              </h1>
              <p className="text-xs text-gray-600 font-medium">Find your next project</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop Only */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="/freelancer" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <span>Browse Jobs</span>
            </Link>
            <Link 
              href="/freelancer/applications" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <span>My Applications</span>
            </Link>
            <Link 
              href="/freelancer/bookings" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <span>My Bookings</span>
            </Link>
            <Link 
              href="/freelancer/payments" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span>Payments</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu - Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop Separator & User Button */}
            <div className="hidden md:block h-10 w-px bg-gray-200"></div>
            <div className="transform hover:scale-105 transition-transform duration-200" suppressHydrationWarning>
              <UserButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            <Link 
              href="/freelancer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <Search className="w-5 h-5" />
              </div>
              <span className="font-medium">Browse Jobs</span>
            </Link>
            <Link 
              href="/freelancer/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-medium">My Applications</span>
            </Link>
            <Link 
              href="/freelancer/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-medium">My Bookings</span>
            </Link>
            <Link 
              href="/freelancer/payments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="font-medium">Payments</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
