'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export function Nav({ children }: { children: React.ReactNode }) {
  return (
    <nav className='bg-transparent text-primary-foreground flex justify-center px-4 border-b border-black'>{children}</nav>
  )
}

export function NavLink (props: Omit<React.ComponentProps<typeof Link>, 'className'>) {

  const pathname = usePathname()
  
  return <Link {...props} className={cn('flex gap-2 items-center p-4 text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground', pathname === props.href && 'bg-background text-red-500')} />
}
