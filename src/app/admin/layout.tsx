import React from 'react'
import { Nav, NavLink } from './_components/nav-link';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className='min-h-screen box-border'>
      <Nav>
        <NavLink href={'/admin'}>Dashboard</NavLink>
        <NavLink href={'/admin/products'}>Products</NavLink>
        <NavLink href={'/admin/categories'}>categories</NavLink>
        <NavLink href={'/admin/users'}>Customers</NavLink>
        <NavLink href={'/admin/orders'}>Sales</NavLink>
      </Nav>
      <div className='container my-6 mx-auto'>{children}</div>
    </div>
  )
}
  