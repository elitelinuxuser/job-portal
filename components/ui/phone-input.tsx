'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string
  onValueChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      // Remove all non-digit characters
      const digitsOnly = inputValue.replace(/\D/g, '')
      
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10)
      
      // Call both onChange handlers
      if (onChange) {
        onChange(e)
      }
      if (onValueChange) {
        onValueChange(limitedDigits)
      }
    }

    return (
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none">
          <span className="text-sm font-medium text-gray-700">+91</span>
        </div>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          className={cn('pl-12', className)}
          placeholder="9876543210"
          maxLength={10}
          {...props}
        />
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
