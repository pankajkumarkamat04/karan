"use client"
import CartSidebar from '@/components/StoreProducts/CartSidebar'
import React from 'react'

export default function CartPage() {
  return (
    <div className='max-w-md mx-auto px-4 2 lg:py-10 lg:bg-[#090807] lg:border border-[#3b3b3b] text-white rounded-lg p-4 space-y-6 my-10'>
        <CartSidebar />
    </div>
  )
}
