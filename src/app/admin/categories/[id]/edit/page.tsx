import PageHeader from '../../../_components/page-header'
import NewCategoryForm from '../../_components/new-category-form'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

type Props = {
  //next15 ve sonrasında Dinamik route parametreleri async olarak resolve ediliyor
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {

  const { id } = await params

  //aslında bu koda gerek yok gibi 
  if (!id) {
    notFound()
  }

  const category = await prisma.category.findUnique({ where: { id }})

  if (!category) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    select: { slug: true },
  })
  
  return (
    <>
      <PageHeader>Edit Category</PageHeader> 
      <NewCategoryForm 
        category={category} 
        existingSlugs={categories.map((category) => category.slug)}
      />
    </>
  )
}