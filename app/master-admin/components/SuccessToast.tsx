'use client'

import { useEffect } from 'react'

interface SuccessToastProps {
  message: string
  onClose: () => void
}

export default function SuccessToast({ message, onClose }: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-[70] animate-slide-in">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
        <span className="text-2xl">✓</span>
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  )
}
