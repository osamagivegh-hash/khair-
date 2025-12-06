'use client'

import { useState } from 'react'
import { Settings, Image, FolderOpen, Newspaper, Layout } from 'lucide-react'
import SlidesManager from '@/components/admin/SlidesManager'
import ProgramsManager from '@/components/admin/ProgramsManager'
import NewsManager from '@/components/admin/NewsManager'

type Tab = 'slides' | 'programs' | 'news'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('slides')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={32} />
              <div>
                <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                <p className="text-white/80 text-sm">إدارة محتوى الموقع</p>
              </div>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              العودة للموقع
            </a>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'slides'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Image size={20} />
              <span>شرائح البطل</span>
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'programs'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <FolderOpen size={20} />
              <span>المشاريع</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'news'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Newspaper size={20} />
              <span>الأخبار</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'slides' && <SlidesManager />}
          {activeTab === 'programs' && <ProgramsManager />}
          {activeTab === 'news' && <NewsManager />}
        </div>
      </div>
    </div>
  )
}






