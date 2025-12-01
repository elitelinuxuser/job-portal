'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  SlidersHorizontal, 
  X,
  IndianRupee,
  ChevronDown,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'

export interface PaymentFilterState {
  search: string
  statuses: string[]
  minAmount: string
  maxAmount: string
  sortBy: 'recent' | 'amount-high' | 'amount-low' | 'oldest'
}

interface PaymentFiltersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (filters: PaymentFilterState, filteredPayments: any[]) => void
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'awaiting_confirmation', label: 'Awaiting Confirmation', icon: Clock },
  { value: 'paid', label: 'Paid', icon: CheckCircle2 },
  { value: 'disputed', label: 'Disputed', icon: AlertTriangle },
  { value: 'declined', label: 'Declined', icon: XCircle },
]

export function PaymentFilters({ payments, onFilterChange }: PaymentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<PaymentFilterState>({
    search: '',
    statuses: [],
    minAmount: '',
    maxAmount: '',
    sortBy: 'recent'
  })

  // Apply filters using useMemo
  const filteredPayments = useMemo(() => {
    let filtered = [...payments]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(payment => 
        payment.booking?.job?.title?.toLowerCase().includes(searchLower) ||
        payment.booking?.company?.companyProfile?.companyName?.toLowerCase().includes(searchLower) ||
        payment.requestNotes?.toLowerCase().includes(searchLower) ||
        payment.paymentNotes?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(payment => 
        filters.statuses.includes(payment.status)
      )
    }

    // Amount filter
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount)
      filtered = filtered.filter(payment => parseFloat(payment.amount) >= min)
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount)
      filtered = filtered.filter(payment => parseFloat(payment.amount) <= max)
    }

    // Sorting
    switch (filters.sortBy) {
      case 'amount-high':
        filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        break
      case 'amount-low':
        filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [filters, payments])

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters, filteredPayments)
  }, [filters, filteredPayments, onFilterChange])

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }

  const clearAllFilters = () => {
    const initialFilters: PaymentFilterState = {
      search: '',
      statuses: [],
      minAmount: '',
      maxAmount: '',
      sortBy: 'recent'
    }
    setFilters(initialFilters)
  }

  const activeFilterCount = 
    (filters.statuses.length > 0 ? 1 : 0) +
    (filters.minAmount || filters.maxAmount ? 1 : 0)

  const removeFilterChip = (type: 'status' | 'amount', value?: string) => {
    if (type === 'status' && value) {
      handleStatusToggle(value)
    } else if (type === 'amount') {
      setFilters(prev => ({ ...prev, minAmount: '', maxAmount: '' }))
    }
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(opt => opt.value === status)?.label || status
  }

  return (
    <div className="space-y-3">
      {/* Search Bar & Filter Button */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search payments, companies, or notes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 h-10 text-sm placeholder:text-sm bg-white"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="default"
              className="h-10 px-4 gap-2 relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-green-600">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-auto max-h-[92vh] px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
            hideClose
          >
            {/* Gradient Header */}
            <div className="relative bg-linear-to-br from-green-600 via-green-500 to-emerald-500 px-6 pt-6 pb-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="pr-12">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <SheetTitle className="text-2xl font-bold text-white mb-1">
                  Filters
                </SheetTitle>
                
                <SheetDescription className="text-green-50 text-base">
                  Refine your payment search with these filters
                </SheetDescription>
              </div>
            </div>

            {/* Filter Content */}
            <div className="px-6 pt-6 pb-safe bg-white overflow-y-auto max-h-[70vh] space-y-6">
              {/* Status Filter */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Payment Status</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal"
                    >
                      {filters.statuses.length === 0 ? (
                        <span className="text-gray-500">Select payment status</span>
                      ) : filters.statuses.length === 1 ? (
                        <span className="truncate">{getStatusLabel(filters.statuses[0])}</span>
                      ) : filters.statuses.length === 2 ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="secondary" className="shrink-0">
                            {getStatusLabel(filters.statuses[0])}
                          </Badge>
                          <Badge variant="secondary" className="shrink-0">
                            {getStatusLabel(filters.statuses[1])}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="secondary" className="shrink-0">
                            {getStatusLabel(filters.statuses[0])}
                          </Badge>
                          <Badge variant="secondary" className="shrink-0">
                            {getStatusLabel(filters.statuses[1])}
                          </Badge>
                          <Badge variant="secondary" className="shrink-0">
                            +{filters.statuses.length - 2}
                          </Badge>
                        </div>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full min-w-[280px] p-0" align="start">
                    <div className="max-h-[300px] overflow-y-auto">
                      {STATUS_OPTIONS.map((status) => {
                        const StatusIcon = status.icon
                        return (
                          <div
                            key={status.value}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors",
                              filters.statuses.includes(status.value) && "bg-green-50"
                            )}
                            onClick={() => handleStatusToggle(status.value)}
                          >
                            <Checkbox
                              checked={filters.statuses.includes(status.value)}
                              onCheckedChange={() => handleStatusToggle(status.value)}
                              className="pointer-events-none"
                            />
                            <StatusIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm flex-1">{status.label}</span>
                            {filters.statuses.includes(status.value) && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Amount Range */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="w-4 h-4 text-gray-600" />
                  <Label className="text-base font-semibold">Amount Range</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="minAmount" className="text-xs text-gray-600 mb-1">Min</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="0"
                      value={filters.minAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAmount" className="text-xs text-gray-600 mb-1">Max</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      placeholder="100000"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 sticky bottom-0 bg-white pb-6 border-t">
                {activeFilterCount > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                )}
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filter Chips */}
      {(filters.statuses.length > 0 || filters.minAmount || filters.maxAmount) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Active filters:</span>
          
          {filters.statuses.map(status => (
            <Badge 
              key={status} 
              variant="secondary" 
              className="gap-1 pr-1 pl-3 py-1.5 cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilterChip('status', status)}
            >
              {getStatusLabel(status)}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          
          {(filters.minAmount || filters.maxAmount) && (
            <Badge 
              variant="secondary" 
              className="gap-1 pr-1 pl-3 py-1.5 cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilterChip('amount')}
            >
              <IndianRupee className="w-3 h-3" />
              ₹{filters.minAmount || '0'} - ₹{filters.maxAmount || '∞'}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}

          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
