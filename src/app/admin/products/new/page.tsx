import React from 'react'
import PageHeader from '../../_components/page-header'
import NewProductForm from '../_components/new-product-form'
import prisma from '@/lib/prisma'

export default async function AddNewProductPage() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <>
      <PageHeader>New Product</PageHeader>
      <NewProductForm product={null} categories={categories} />
    </>
  )
}
