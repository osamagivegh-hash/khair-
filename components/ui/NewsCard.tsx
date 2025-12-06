'use client'

import { News } from '@prisma/client'
import { motion } from 'framer-motion'
import { Calendar, AlertCircle } from 'lucide-react'

export default function NewsCard({ news }: { news: News }) {
  const date = new Date(news.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full"
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          {news.isBreaking && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <AlertCircle size={12} />
              عاجل
            </span>
          )}
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Calendar size={14} />
            <span>{date}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {news.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
          {news.content}
        </p>
      </div>
    </motion.div>
  )
}



