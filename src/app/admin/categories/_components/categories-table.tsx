import prisma from '@/lib/prisma'
import { formatNumber } from '@/lib/formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { DeleteDropdownItem } from './categories-table-delete'

export default async function CategoriesTable() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  }) 

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8">
        <p className="font-medium text-gray-500">Goruntulenecek kategori bulunamadi.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Categoriess</TableHead>
          <TableHead className='w-0'>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>{category.slug}</TableCell>
            <TableCell>{formatNumber(category._count.products)}</TableCell>
            <TableCell>
            <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className='sr-only'>Actions</span>
                  <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      Edit  
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteDropdownItem id={category.id} disabled={ category._count.products > 0} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
