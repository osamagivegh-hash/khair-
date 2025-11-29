'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface Slide {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  order: number
}

export default function SlidesManager() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    order: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/admin/slides')
      if (!response.ok) {
        console.error('Failed to fetch slides:', response.status, response.statusText)
        setSlides([])
        return
      }
      const data = await response.json()
      // Ensure data is an array
      setSlides(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch slides:', error)
      setSlides([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingSlide
        ? `/api/admin/slides/${editingSlide.id}`
        : '/api/admin/slides'
      const method = editingSlide ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchSlides()
        resetForm()
      } else {
        alert('فشل الحفظ')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return

    try {
      const response = await fetch(`/api/admin/slides/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSlides()
      } else {
        alert('فشل الحذف')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ')
    }
  }

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      order: slide.order,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', imageUrl: '', order: 0 })
    setEditingSlide(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة شرائح البطل</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus size={20} />
          {showForm ? 'إلغاء' : 'إضافة شريحة جديدة'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان الفرعي
            </label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
            currentImage={formData.imageUrl}
            folder="al-khair/slides"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الترتيب
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  جاري الحفظ...
                </span>
              ) : (
                editingSlide ? 'تحديث' : 'إضافة'
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative h-32 bg-gray-200">
              {slide.imageUrl && (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{slide.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{slide.subtitle}</p>
              <p className="text-xs text-gray-500 mb-3">الترتيب: {slide.order}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(slide)}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  <Edit size={14} className="inline ml-1" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} className="inline ml-1" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          لا توجد شرائح. اضغط على "إضافة شريحة جديدة" للبدء.
        </div>
      )}
    </div>
  )
}

