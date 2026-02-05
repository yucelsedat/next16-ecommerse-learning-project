'use client'

import { cn } from "@/lib/utils"
import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { ActionState, addProduct } from '../../_actions/products'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/formatters"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Image, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { error } from "console"

const initialState:ActionState = {}

export default function NewProductForm() {

  const router = useRouter()

  const [state, formAction, isActionPending] = useActionState(addProduct, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/admin/products')
    }
  }, [state.success, router])  

  const [priceInCents, setPriceInCents] = useState<number>()
  const [uploadProgress, setUploadProgress] = useState<number>(15)
  const [fileName, setFileName] = useState<string>('Click to upload')

  const fileRef = useRef<HTMLInputElement | null>(null)

  const isUploading = false
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    fileRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  return (
    <form action={formAction} className="w-2/3 mx-auto">
      {/* GRID LAYOUT */}
      <div className="grid grid-cols-3">
        {/* flex-1 */}
        <div
          className='relative h-full flex-1 mx-auto w-2/3 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center hover:bg-gray-900/8' 
          onClick={handleClick}
        >
          <div className="relative flex flex-1 my-32 flex-col items-center justify-center w-full">
            {isUploading || isPending ? <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
            : <Image className="h-6 w-6 text-zinc-500 mb-2"/>}
            <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                {
                  isUploading 
                    ? <div className="flex flex-col items-center">
                        <p>Uploading...</p>
                        {/* buraya progress bar animasyonu koyalım */}
                        <Progress value={uploadProgress} className="mt-2 w-40 h-2 bg-gray-300"/>
                      </div> 
                    : isPending 
                      ? <div>
                          <p>Redirecting, please wait...</p>
                      </div> 
                      : <div >
                        {fileName}
                        <input 
                          ref={fileRef} 
                          className='hidden' 
                          type="file" 
                          name="image" 
                          onChange={handleChange}
                          // required
                        />
                      </div>
                }

              </div>
              {isPending 
                ? null 
                : <p className="text-xs text-zinc-500 ">
                  PNG, JPG, JPEG
                </p>
              }
          </div>
        </div>
        {/* col2 + col3 */}
        <div className="col-span-2 flex flex-col justify-between">
          <div className="space-y-2 ">
            <Label htmlFor="name">Name</Label>
            <Input type="text" id='name' name='name' required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceInCents">Price In Cents</Label>
            <Input type="number" id='priceInCents' name='priceInCents' required value={priceInCents} onChange={e => setPriceInCents(Number(e.target.value) || undefined)} />
            <div className="text-muted-foreground">
              {formatCurrency((priceInCents || 0) / 100)}
            </div>
          </div>
          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id='description' name='description' required />
          </div>
        </div>
      </div> 
      <div className="grid mt-6 space-y-2">
        <Button className="place-self-center" disabled={isActionPending}>
        {isActionPending ? 'Kaydediliyor…' : 'Ürün Ekle'}
        </Button>
        <span className="place-self-center">
          {/* {JSON.stringify(state)} */}
          {JSON.stringify(state?.message)??JSON.stringify(state?.errors?.image[0])}
        </span>
      </div>
    </form>
  )
}
