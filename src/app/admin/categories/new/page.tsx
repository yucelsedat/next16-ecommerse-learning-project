import React from 'react'
import PageHeader from '../../_components/page-header'
import NewCategoryForm from '../_components/new-category-form'
import prisma from '@/lib/prisma'


export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  })

  return (
  <>
    <PageHeader>New Category</PageHeader>
    <NewCategoryForm
      category={null}
      existingSlugs={categories.map((category) => category.slug)}
    />
  </>
  )
}
