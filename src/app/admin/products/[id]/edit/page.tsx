import React from 'react'
import PageHeader from '../../../_components/page-header'
import NewProductForm from '../../_components/new-product-form'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

type Props = {
  //next15 ve sonrasında Dinamik route parametreleri async olarak resolve ediliyor
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {

  const { id } = await params

  if (!id) {
    notFound()
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      description: true,
      imgPath: true,
      categories: {
        select: { categoryId: true },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })
  
  return (
    <>
      <PageHeader>Edit Product</PageHeader> 
      <NewProductForm product={product} categories={categories} />
    </>
  )
}
