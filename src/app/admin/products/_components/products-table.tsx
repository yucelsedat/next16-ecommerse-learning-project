import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, MoreVertical, XCircle } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import prisma from '@/lib/prisma'



export default async function ProductsTable() {
  
   const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true, 
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orders: true}},
    },
    orderBy: { name: 'asc'}
  })  

  if( products.length === 0) return (
        <div className="flex flex-col items-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-medium">Görüntülenecek veri bulunamadı.</p>
      </div>
  )
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-0'>
            <span className='sr-only'>Avaible For Purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map(product => (
          <TableRow key={product.id}>
            <TableCell>
              {product.isAvailableForPurchase?
                <>
                  <span className='sr-only'>Available</span>
                  <CheckCircle2/>
                </> :
                <>
                  <span className='sr-only'>Unavailable</span>
                  <XCircle/>
                </> 
              }
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{formatCurrency(product.priceInCents / 100)}</TableCell>
            <TableCell>{formatNumber(product._count.orders)}</TableCell>
            <TableCell>
              <span className='sr-only'>Actions</span>
              <MoreVertical />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

