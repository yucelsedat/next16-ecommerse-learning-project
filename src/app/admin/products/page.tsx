import PageHeader from '../_components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProductsTable from './_components/products-table';
import { Suspense } from 'react';


export default function ProductsPage() {
    

   return (
    <>
      <div className='flex justify-between items-center gap-4'>
        <PageHeader>Products</PageHeader>
        <Button asChild>
          <Link href={`/admin/products/new`}>add new</Link>
        </Button>
      </div>
      <Suspense fallback={<Loader />} >
        <ProductsTable />
      </Suspense>
    </>
  ) 
}

function Loader() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded-xl"></div>
      </div>
    )
}
