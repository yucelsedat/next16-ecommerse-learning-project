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

  const product = await prisma.product.findUnique({ where: { id }})

  if (!product) {
    notFound()
  }
  
  return (
    <>
      <PageHeader>Edit Product</PageHeader> 
      <NewProductForm product={product} />
    </>
  )
}