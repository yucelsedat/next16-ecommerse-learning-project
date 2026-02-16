'use client'

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"
import { deleteCategory } from "../../_actions/categories"

export function DeleteDropdownItem({ id, disabled }: { id: string, disabled: boolean}) {

  const [isPending, startTransition ] = useTransition()
  
  return (
    <DropdownMenuItem 
      disabled={ disabled ||isPending }
      onClick={() => {
        startTransition( async () => {
         await deleteCategory(id)
      })
    }}>
      Delete
    </DropdownMenuItem>
  )
}