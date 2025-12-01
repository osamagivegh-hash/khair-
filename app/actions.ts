'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSlides() {
    try {
        return await prisma.slide.findMany({
            orderBy: { order: 'asc' },
        })
    } catch (error) {
        console.error('Failed to fetch slides:', error)
        return []
    }
}

export async function getBreakingNews() {
    try {
        return await prisma.news.findMany({
            where: { isBreaking: true },
            orderBy: { createdAt: 'desc' },
        })
    } catch (error) {
        console.error('Failed to fetch news:', error)
        return []
    }
}

export async function getAllNews() {
    try {
        return await prisma.news.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10, // Limit to latest 10 news items
        })
    } catch (error) {
        console.error('Failed to fetch all news:', error)
        return []
    }
}

export async function getPrograms() {
    try {
        return await prisma.program.findMany({
            orderBy: { createdAt: 'desc' },
            take: 6,
        })
    } catch (error) {
        console.error('Failed to fetch programs:', error)
        return []
    }
}

export async function submitMessage(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!name || !email || !message) {
        return { success: false, error: 'Missing required fields' }
    }

    try {
        await prisma.message.create({
            data: {
                name,
                email,
                subject: subject || 'No Subject',
                message,
            },
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to submit message:', error)
        return { success: false, error: 'Failed to submit message' }
    }
}
