'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface Program {
  id: string
  title: string
  description: string
  targetAmount: number
  raisedAmount: number
  imageUrl: string
  category: string
}

export default function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    raisedAmount: 0,
    imageUrl: '',
    category: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/programs')
      if (!response.ok) {
        console.error('Failed to fetch programs:', response.status, response.statusText)
        setPrograms([])
        return
      }
      const data = await response.json()
      // Ensure data is an array
      setPrograms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch programs:', error)
      setPrograms([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingProgram
        ? `/api/admin/programs/${editingProgram.id}`
        : '/api/admin/programs'
      const method = editingProgram ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchPrograms()
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
      const response = await fetch(`/api/admin/programs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchPrograms()
      } else {
        alert('فشل الحذف')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ')
    }
  }

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      title: program.title,
      description: program.description,
      targetAmount: program.targetAmount,
      raisedAmount: program.raisedAmount,
      imageUrl: program.imageUrl,
      category: program.category,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: 0,
      raisedAmount: 0,
      imageUrl: '',
      category: '',
    })
    setEditingProgram(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة المشاريع</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus size={20} />
          {showForm ? 'إلغاء' : 'إضافة مشروع جديد'}
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
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ المستهدف (ر.س)
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ المجموع (ر.س)
              </label>
              <input
                type="number"
                value={formData.raisedAmount}
                onChange={(e) => setFormData({ ...formData, raisedAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
            currentImage={formData.imageUrl}
            folder="al-khair/programs"
          />

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
                editingProgram ? 'تحديث' : 'إضافة'
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
        {programs.map((program) => (
          <div key={program.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative h-32 bg-gray-200">
              {program.imageUrl && (
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{program.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{program.description}</p>
              <div className="text-xs text-gray-500 mb-2">
                <p>المستهدف: {program.targetAmount.toLocaleString()} ر.س</p>
                <p>المجموع: {program.raisedAmount.toLocaleString()} ر.س</p>
                <p>الفئة: {program.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(program)}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  <Edit size={14} className="inline ml-1" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
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

      {programs.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          لا توجد مشاريع. اضغط على "إضافة مشروع جديد" للبدء.
        </div>
      )}
    </div>
  )
}

