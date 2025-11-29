'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'

interface News {
  id: string
  title: string
  content: string
  isBreaking: boolean
  createdAt: string
}

export default function NewsManager() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isBreaking: false,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/admin/news')
      const data = await response.json()
      // Ensure data is always an array
      setNews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch news:', error)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingNews
        ? `/api/admin/news/${editingNews.id}`
        : '/api/admin/news'
      const method = editingNews ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchNews()
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
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchNews()
      } else {
        alert('فشل الحذف')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ')
    }
  }

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      isBreaking: newsItem.isBreaking,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', isBreaking: false })
    setEditingNews(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الأخبار</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus size={20} />
          {showForm ? 'إلغاء' : 'إضافة خبر جديد'}
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
              المحتوى
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={6}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isBreaking"
              checked={formData.isBreaking}
              onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isBreaking" className="mr-2 text-sm font-medium text-gray-700">
              خبر عاجل
            </label>
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
                editingNews ? 'تحديث' : 'إضافة'
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

      <div className="space-y-4">
        {news.map((newsItem) => (
          <div key={newsItem.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{newsItem.title}</h3>
                  {newsItem.isBreaking && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                      عاجل
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{newsItem.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(newsItem.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(newsItem)}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  <Edit size={14} className="inline ml-1" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(newsItem.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} className="inline ml-1" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          لا توجد أخبار. اضغط على "إضافة خبر جديد" للبدء.
        </div>
      )}
    </div>
  )
}

