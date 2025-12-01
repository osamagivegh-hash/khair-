import { getBreakingNews, getPrograms, getSlides, getAllNews } from './actions'
import Header from '@/components/ui/Header'
import HeroSlider from '@/components/ui/HeroSlider'
import ProgramCard from '@/components/ui/ProgramCard'
import NewsCard from '@/components/ui/NewsCard'
import ContactForm from '@/components/ui/ContactForm'
import Footer from '@/components/ui/Footer'
import NewsTicker from '@/components/ui/NewsTicker'
import { HeartHandshake, Users, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [slides, programs, breakingNews, allNews] = await Promise.all([
    getSlides(),
    getPrograms(),
    getBreakingNews(),
    getAllNews(),
  ])

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && <NewsTicker news={breakingNews} />}

      {/* Hero Section */}
      <section className="relative pt-[120px]">
        <HeroSlider slides={slides} />
      </section>

      {/* News Section */}
      {allNews.length > 0 && (
        <section id="news" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-primary font-bold text-lg mb-2">الأخبار</h2>
              <h3 className="text-4xl font-bold text-gray-800 mb-4">آخر الأخبار</h3>
              <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allNews.map((newsItem) => (
                <NewsCard key={newsItem.id} news={newsItem} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programs Section */}
      <section id="programs" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold text-lg mb-2">مشاريعنا</h2>
            <h3 className="text-4xl font-bold text-gray-800 mb-4">ساهم في الخير</h3>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-full transition-colors">
              عرض جميع المشاريع
            </button>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-secondary font-bold text-lg mb-2">رسالتنا</h2>
              <h3 className="text-4xl font-bold mb-6">نصنع الأمل ونبني المستقبل</h3>
              <p className="text-lg leading-relaxed text-white/90 mb-8">
                نؤمن بأن الخير موجود في كل مكان، ومهمتنا هي إيصاله لمستحقيه بأمانة وشفافية. نسعى لتمكين المجتمعات الفقيرة وتوفير حياة كريمة للأيتام والأرامل والمحتاجين.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-1 rounded-full text-secondary">
                    <HeartHandshake size={20} />
                  </div>
                  <span>شفافية تامة في جميع التعاملات</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-1 rounded-full text-secondary">
                    <Users size={20} />
                  </div>
                  <span>فريق عمل متخصص ومحترف</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-1 rounded-full text-secondary">
                    <Globe size={20} />
                  </div>
                  <span>وصول عالمي للمناطق الأكثر احتياجاً</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent z-10"></div>
              {/* Using a static image for vision section */}
              <img
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop"
                alt="Vision"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 bg-primary text-white flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-4">تواصل معنا</h3>
                <p className="mb-8 text-white/80">
                  نسعد باستقبال استفساراتكم واقتراحاتكم. فريقنا جاهز للرد عليكم في أقرب وقت.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <Globe size={24} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">الموقع الرئيسي</p>
                      <p className="font-medium">الرياض، المملكة العربية السعودية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <HeartHandshake size={24} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">ساعات العمل</p>
                      <p className="font-medium">الأحد - الخميس: 9ص - 5م</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-12">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
