'use client'

import Link from 'next/link'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { 
  Calendar, 
  Search,
  Menu,
  X,
  FileText,
  IndianRupee,
  User
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
            <Image 
              src="/logo.svg" 
              alt="HFree" 
              width={44} 
              height={44} 
              className="rounded-xl group-hover:scale-105 transition-transform duration-300" 
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">
                HFree
              </h1>
              <p className="hidden sm:block text-xs text-gray-600 font-medium">Freelancer Portal</p>
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
            <Link 
              href="/freelancer/profile" 
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <User className="w-4 h-4" />
              </div>
              <span>My Profile</span>
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
            <Link 
              href="/freelancer/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <span className="font-medium">My Profile</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
