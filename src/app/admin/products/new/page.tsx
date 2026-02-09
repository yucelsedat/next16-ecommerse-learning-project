import React from 'react'
import PageHeader from '../../_components/page-header'
import NewProductForm from '../_components/new-product-form'

export default function AddNewProductPage() {
  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <NewProductForm product={null}/>
    </>
  )
}
