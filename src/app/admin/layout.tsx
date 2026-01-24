import React from 'react'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <div className='container my-6'>{children}</div>
    </>
  )
}
  