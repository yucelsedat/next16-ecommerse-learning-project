'use client'

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { ActionState, addProduct, updateProduct } from '../../_actions/products'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/formatters"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Image, Loader2 } from "lucide-react"
import NextImage from "next/image"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"

type ProductCategoryOption = {
  id: string
  name: string
}

type EditableProduct = {
  id: string
  name: string
  priceInCents: number
  description: string
  imgPath: string
  categories: { categoryId: string }[]
}

type NewProductFormProps = {
  product?: EditableProduct | null
  categories: ProductCategoryOption[]
}

const initialState: ActionState = {}

export default function NewProductForm({ product, categories }: NewProductFormProps) {
  const router = useRouter()

  const [state, formAction, isActionPending] = useActionState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    initialState
  )

  useEffect(() => {
    if (state.success) {
      router.push('/admin/products')
    }
  }, [state.success, router])

  const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents)
  const [fileName, setFileName] = useState<string>(product?.imgPath || 'Click to upload')
  const [uploadProgress, setUploadProgress] = useState<number>(15)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isPending] = useTransition()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    product?.categories[0]?.categoryId || ''
  )
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories]
  )

  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    fileRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name)
      handleFileChange(e.target.files[0])
    }
  }

  const handleFileChange = (file: File) => {
    const reader = new FileReader()

    setUploading(true)
    setUploadProgress(0)

    reader.onprogress = (event) => {
      if (!event.lengthComputable) return
      const percent = Math.round((event.loaded * 100) / event.total)
      setUploadProgress(percent)
    }

    const minDuration = 400
    const start = performance.now()

    reader.onloadend = () => {
      const elapsed = performance.now() - start
      const remaining = Math.max(0, minDuration - elapsed)

      setTimeout(() => {
        setPreview(reader.result as string)
        setUploading(false)
      }, remaining)
    }

    reader.readAsDataURL(file)
  }

  return (
    <form action={formAction} className="w-2/3 mx-auto">
      <div className="grid grid-cols-3 gap-6">
        <div
          className='relative h-80 flex-1 mx-auto w-2/3 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center hover:bg-gray-900/8 hover:cursor-pointer'
          onClick={handleClick}
        >
          <input
            ref={fileRef}
            className='hidden'
            type="file"
            name="image"
            onChange={handleChange}
          />
          {preview || product ? (
            <div className="relative h-full w-full">
              <NextImage
                src={preview || product?.imgPath || ""}
                alt="Preview"
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="rounded-md border object-cover mx-auto"
                unoptimized={Boolean(preview)}
              />
            </div>
          ) : (
            <div className="relative flex flex-1 my-32 flex-col items-center justify-center w-full">
              {uploading || isPending ? (
                <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
              ) : (
                <Image className="h-6 w-6 text-zinc-500 mb-2" />
              )}
              <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <p>Uploading...</p>
                    <Progress value={uploadProgress} className="mt-2 w-40 h-2 bg-gray-300" />
                  </div>
                ) : isPending ? (
                  <div>
                    <p>Redirecting, please wait...</p>
                  </div>
                ) : (
                  <div>{fileName}</div>
                )}
              </div>
              {isPending ? null : <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>}
            </div>
          )}
        </div>

        <div className="col-span-2 flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input type="text" id='name' name='name' required defaultValue={product?.name || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceInCents">Price In Cents</Label>
            <Input
              type="number"
              id='priceInCents'
              name='priceInCents'
              required
              value={priceInCents}
              onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
            />
            <div className="text-muted-foreground">
              {formatCurrency((priceInCents || 0) / 100)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <input type="hidden" name="categoryId" value={selectedCategoryId} />
            <Combobox
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              options={categoryOptions}
              placeholder="Kategori secin"
              searchPlaceholder="Kategori ara..."
              emptyText="Kategori bulunamadi."
            />
            {state.errors?.categoryId?.[0] && (
              <p className="text-sm text-red-500">{state.errors.categoryId[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id='description' name='description' required defaultValue={product?.description || ''} />
          </div>
        </div>
      </div>

      <div className="grid mt-6 space-y-2">
        <Button
          className="place-self-center"
          disabled={isActionPending || categories.length === 0 || selectedCategoryId.length === 0}
        >
          {isActionPending ? 'Kaydediliyor...' : 'Urun Ekle'}
        </Button>
        <span className="place-self-center text-red-500">
          {state.message ?? state.errors?.image?.[0]}
        </span>
        <span className="place-self-center text-gray-500">
          {fileName !== 'Click to upload' && fileName}
        </span>
      </div>
    </form>
  )
}
