'use client'

import { useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  currentImage?: string
  folder?: string
}

export default function ImageUpload({ onUploadComplete, currentImage, folder = 'al-khair' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('الرجاء اختيار ملف صورة')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('حجم الملف يجب أن يكون أقل من 10 ميجابايت')
      return
    }

    setError(null)
    setUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Cloudinary
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response JSON:', e);
        setError('خطأ في الخادم (Invalid JSON response)');
        setPreview(null);
        return;
      }

      if (!response.ok) {
        console.error('Upload failed:', data);
        setError(data.error || data.message || 'فشل رفع الصورة');
        setPreview(null);
        return;
      }

      if (data.success) {
        setPreview(data.url)
        onUploadComplete(data.url)
      } else {
        setError(data.error || 'فشل رفع الصورة')
        setPreview(null)
      }
    } catch (err) {
      console.error('Upload error:', err)
      if (err instanceof SyntaxError) {
        setError('خطأ في الخادم: استجابة غير صحيحة');
      } else {
        setError('حدث خطأ أثناء رفع الصورة')
      }
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setPreview(null)
    onUploadComplete('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        الصورة
      </label>

      {preview ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
            ) : (
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
            )}
            <p className="mb-2 text-sm text-gray-500">
              {uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة أو اسحبها هنا'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (حد أقصى 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}






