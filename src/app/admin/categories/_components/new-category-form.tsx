'use client'

import React, { useActionState, useEffect, useMemo, useState } from 'react'
import { Category } from '../../../../../generated/prisma/browser'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ActionState, addCategory, updateCategory } from '../../_actions/categories'
import { useRouter } from 'next/navigation'

// ilede edit icin lazim olacak
type NewCategoryFormProps = {
  // sadece client componentlerde browser dan import et!!!
  category?: Category | null
  existingSlugs: string[]
}

const initialState: ActionState = {}

function toSlug(value: string): string {
  const mapped = value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')

  return mapped
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function makeUniqueSlug(
  slug: string,
  existingSlugs: Set<string>,
  currentSlug?: string
): string {
  if (!slug) return ''

  const normalizedCurrent = currentSlug?.toLowerCase()
  const isTaken = (candidate: string) =>
    existingSlugs.has(candidate) && candidate !== normalizedCurrent

  if (!isTaken(slug)) return slug

  let suffix = 2
  let candidate = `${slug}-${suffix}`

  while (isTaken(candidate)) {
    suffix += 1
    candidate = `${slug}-${suffix}`
  }

  return candidate
}

export default function NewCategoryForm({
  category,
  existingSlugs,
}: NewCategoryFormProps) {
  const router = useRouter()

  const [state, formAction, isActionPending] = useActionState(
    category == null ? addCategory : updateCategory.bind(null, category.id),
    initialState
  )

  useEffect(() => {
    if (state.success) {
      router.push('/admin/categories')
    }
  }, [state.success, router])

  const normalizedExistingSlugs = useMemo(
    () => new Set(existingSlugs.map((existingSlug) => existingSlug.toLowerCase())),
    [existingSlugs]
  )

  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(category != null)

  const slugErrorFromServer = state.errors?.slug?.[0]
  const isSlugDuplicate =
    slug.length > 0
    && normalizedExistingSlugs.has(slug.toLowerCase())
    && slug.toLowerCase() !== category?.slug?.toLowerCase()
  
  return (
    <form action={formAction} className="w-2/3 h-[50vh] mx-auto">
      <div className="h-[50vh] flex flex-col gap-8">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            value={name}
            onChange={(event) => {
              const nextName = event.target.value
              setName(nextName)

              if (!isSlugManuallyEdited) {
                const autoSlug = toSlug(nextName)
                setSlug(
                  makeUniqueSlug(
                    autoSlug,
                    normalizedExistingSlugs,
                    category?.slug
                  )
                )
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            type="text"
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setIsSlugManuallyEdited(true)
              setSlug(toSlug(event.target.value))
            }}
          />
          <p className="text-sm text-muted-foreground">
            Isimden otomatik uretilir, istersen duzenleyebilirsin.
          </p>
          {(isSlugDuplicate || slugErrorFromServer) && (
            <p className="text-sm text-red-500">
              {slugErrorFromServer ?? 'Bu slug zaten kullaniliyor.'}
            </p>
          )}
        </div>
      </div>
      <Button disabled={isActionPending || isSlugDuplicate || slug.length === 0}>
        {isActionPending ? 'Kaydediliyor...' : 'Save'}
      </Button>
      {state.message && (
        <p className="mt-2 text-sm">{state.message}</p>
      )}
    </form>
  )
}
