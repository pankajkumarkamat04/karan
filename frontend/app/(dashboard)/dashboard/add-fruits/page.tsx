'use client'
import React from 'react'
import AddFruitForm from '@/components/Dashboard/AddFruitForm/AddFruitForm'
import { useSearchParams } from 'next/navigation'
export default function AddFruits() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  console.log(id)
  return (
    <AddFruitForm id={id} />
  )
}
