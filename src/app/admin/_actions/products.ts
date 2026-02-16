'use server'

import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type ActionState = {
  success?: boolean
  errors?: Record<string, string[]>
  message?: string
}

const imageSchema = z
  .instanceof(File, { message: 'Lutfen bir resim yukleyiniz.' })
  .refine((file) => file.size > 0, 'Dosya bos olamaz.')
  .refine(
    (file) => (file.type.endsWith('jpg') || file.type.endsWith('jpeg') || file.type.endsWith('png')),
    'Lutfen PNG, JPG veya JPEG uzantili dosya yukleyin.'
  )

const addSchema = z.object({
  name: z.string().min(1, 'Isim gereklidir'),
  description: z.string().min(5, 'Aciklama en az 5 karakter olmali'),
  priceInCents: z.coerce.number().int().min(1, 'Gecerli bir fiyat girin'),
  categoryId: z.string().min(1, 'Kategori secimi gereklidir'),
  image: imageSchema,
})

export async function addProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = addSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    priceInCents: formData.get('priceInCents'),
    categoryId: formData.get('categoryId'),
    image: formData.get('image'),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const { name, description, priceInCents, categoryId, image } = parsed.data

  const imageName = `${crypto.randomUUID()}-${image.name}`
  const imagePublicPath = `/products/${imageName}`
  const imageFsPath = path.join(process.cwd(), 'public', imagePublicPath)

  try {
    await fs.mkdir(path.dirname(imageFsPath), { recursive: true })
    await fs.writeFile(imageFsPath, Buffer.from(await image.arrayBuffer()))

    await prisma.product.create({
      data: {
        name,
        description,
        priceInCents,
        imgPath: imagePublicPath,
        categories: {
          create: { categoryId },
        },
      },
    })

    revalidatePath('/admin/products')

    return { success: true }
  } catch (error) {
    console.error(error)

    return {
      message: 'Urun kaydedilirken sunucu hatasi olustu.',
    }
  }
}

const editSchema = addSchema.extend({
  image: z.preprocess(
    (value) => (value instanceof File && value.size === 0 ? undefined : value),
    imageSchema.optional()
  ),
})

export async function updateProduct(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = editSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = parsed.data
  const product = await prisma.product.findUnique({ where: { id } })

  if (product == null) return notFound()

  try {
    let imagePublicPath = product.imgPath

    if (data.image != null && data.image.size > 0) {
      const imageFsPath = path.join(process.cwd(), 'public', product.imgPath)
      await fs.unlink(imageFsPath)

      const imageName = `${crypto.randomUUID()}-${data.image.name}`
      imagePublicPath = `/products/${imageName}`

      const newImageFsPath = path.join(process.cwd(), 'public', imagePublicPath)
      await fs.writeFile(newImageFsPath, Buffer.from(await data.image.arrayBuffer()))
    }

    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        imgPath: imagePublicPath,
        categories: {
          deleteMany: {},
          create: {
            categoryId: data.categoryId,
          },
        },
      },
    })

    revalidatePath('/admin/products')

    return { success: true }
  } catch (error) {
    console.error(error)
    return {
      message: 'Urun kaydedilirken sunucu hatasi olustu.',
    }
  }
}

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
  await prisma.product.update({
    where: { id },
    data: {
      isAvailableForPurchase,
    },
  })
  revalidatePath('/admin/products')
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({ where: { id } })

  if (product == null) return notFound()

  const imageFsPath = path.join(process.cwd(), 'public', product.imgPath)

  await fs.unlink(imageFsPath)

  revalidatePath('/admin/products')
}
