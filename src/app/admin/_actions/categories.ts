'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import { z } from 'zod'

export type ActionState = {
  success?: boolean
  errors?: Record<string, string[]>
  message?: string
}

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Kategori ismi gereklidir'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug gereklidir')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug formati gecersiz'),
})

export async function addCategory(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const { name, slug } = parsed.data

  try {
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing != null) {
      return {
        errors: {
          slug: ['Bu slug zaten kullaniliyor'],
        },
      }
    }

    await prisma.category.create({
      data: {
        name,
        slug,
      },
    })

    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    console.error(error)
    return {
      message: 'Kategori kaydedilirken sunucu hatasi olustu.',
    }
  }
}

export async function updateCategory(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const { name, slug } = parsed.data

  const category = await prisma.category.findUnique({ where: { id } })
  if (category == null) return notFound()

  try {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
      select: { id: true },
    })

    if (existing != null) {
      return {
        errors: {
          slug: ['Bu slug zaten kullaniliyor'],
        },
      }
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
      },
    })

    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    console.error(error)
    return {
      message: 'Kategori guncellenirken sunucu hatasi olustu.',
    }
  }
}

export async function deleteCategory(id: string): Promise<ActionState> {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { _count: { select: { products: true } } },
    })

    if (!category) return notFound()

    if (category._count.products > 0) {
      return { message: 'Bu kategoriye ait urun bulunmaktadir.' }
    }

    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/categories')

    return { success: true }
  } catch (error) {
    console.error(error)
    return { message: 'Kategori silinirken sunucu hatasi olustu.' }
  }
}
