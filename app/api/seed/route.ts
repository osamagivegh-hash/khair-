import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Clear existing data
    await prisma.slide.deleteMany();
    await prisma.program.deleteMany();
    await prisma.news.deleteMany();
    await prisma.message.deleteMany();

    // Seed Slides
    const slides = [
      {
        title: 'سقيا الماء.. صدقة جارية',
        subtitle: 'ساهم في توفير المياه الصالحة للشرب للمحتاجين في المناطق النائية',
        imageUrl: 'https://images.unsplash.com/photo-1548245648-db534d476a33?q=80&w=1770&auto=format&fit=crop',
        order: 1,
      },
      {
        title: 'كفالة الأيتام',
        subtitle: 'كن عوناً وسنداً لهم في حياتهم، فكافل اليتيم رفيق النبي في الجنة',
        imageUrl: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?q=80&w=1770&auto=format&fit=crop',
        order: 2,
      },
      {
        title: 'مساجد وإفطار صائم',
        subtitle: 'اجمع بين أجر بناء بيوت الله وإطعام الصائمين في شهر الخير',
        imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1770&auto=format&fit=crop',
        order: 3,
      },
      {
        title: 'كسوة الشتاء',
        subtitle: 'لمسة دفء تحمي الأسر المتعففة واللاجئين من برد الشتاء القارس',
        imageUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1774&auto=format&fit=crop',
        order: 4,
      },
      {
        title: 'الإغاثة العاجلة',
        subtitle: 'نقف بجانب المتضررين في الأزمات والكوارث لتقديم العون الفوري',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1770&auto=format&fit=crop',
        order: 5,
      },
    ];

    for (const slide of slides) {
      await prisma.slide.create({ data: slide });
    }

    // Seed Programs
    const programs = [
      {
        title: 'كفالة يتيم',
        description: 'برنامج شهري لتوفير الرعاية الكاملة لليتيم من مأكل ومشرب وتعليم وصحة.',
        targetAmount: 50000,
        raisedAmount: 12500,
        imageUrl: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?q=80&w=1770&auto=format&fit=crop',
        category: 'رعاية اجتماعية',
      },
      {
        title: 'بناء مسجد الهدى',
        description: 'المساهمة في بناء مسجد يتسع لـ 500 مصلي في قرية نائية.',
        targetAmount: 150000,
        raisedAmount: 89000,
        imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1770&auto=format&fit=crop',
        category: 'مساجد',
      },
      {
        title: 'حفر بئر ارتوازي',
        description: 'توفير مياه شرب نظيفة لقرية كاملة تعاني من الجفاف.',
        targetAmount: 25000,
        raisedAmount: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1581362072978-14998d01fdaa?q=80&w=1769&auto=format&fit=crop',
        category: 'سقيا الماء',
      },
      {
        title: 'كسوة الشتاء',
        description: 'توزيع ملابس شتوية وبطانيات على الأسر المتعففة واللاجئين.',
        targetAmount: 30000,
        raisedAmount: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1774&auto=format&fit=crop',
        category: 'إغاثة',
      },
      {
        title: 'سلة غذائية',
        description: 'توفير المواد الغذائية الأساسية للأسر الفقيرة لمدة شهر.',
        targetAmount: 10000,
        raisedAmount: 2000,
        imageUrl: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=1770&auto=format&fit=crop',
        category: 'إطعام',
      },
      {
        title: 'دعم طالب علم',
        description: 'كفالة مصاريف دراسية لطلاب العلم غير القادرين.',
        targetAmount: 40000,
        raisedAmount: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1773&auto=format&fit=crop',
        category: 'تعليم',
      },
    ];

    for (const program of programs) {
      await prisma.program.create({ data: program });
    }

    // Seed News
    const newsItems = [
      {
        title: 'توزيع 1000 كسوة شتاء في الشمال',
        content: 'قامت الجمعية بتوزيع أكثر من 1000 كسوة شتوية على اللاجئين في المخيمات الشمالية ضمن حملة "دفء".',
        isBreaking: true,
      },
      {
        title: 'افتتاح بئر "الرحمة" في أفريقيا',
        content: 'بفضل الله تم افتتاح بئر ارتوازي جديد يخدم أكثر من 500 أسرة.',
        isBreaking: true,
      },
      {
        title: 'انطلاق حملة رمضان الخير',
        content: 'نستعد لاستقبال شهر رمضان المبارك بحزمة من المشاريع الخيرية.',
        isBreaking: false,
      },
      {
        title: 'زيارة وفد الجمعية للأيتام',
        content: 'قام وفد من الجمعية بزيارة تفقدية للأيتام المكفولين وتوزيع الهدايا عليهم.',
        isBreaking: false,
      },
    ];

    for (const news of newsItems) {
      await prisma.news.create({ data: news });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      slides: slides.length,
      programs: programs.length,
      news: newsItems.length,
    });
  } catch (error) {
    console.error('Seeding failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}






