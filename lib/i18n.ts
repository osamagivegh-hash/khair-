/**
 * Internationalization (i18n) utilities for bilingual support
 * Supports Arabic (ar) and English (en)
 */

export type Language = 'ar' | 'en';

export const defaultLanguage: Language = 'ar';

export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    about: 'من نحن',
    programs: 'المشاريع',
    news: 'الأخبار',
    contact: 'اتصل بنا',
    admin: 'لوحة التحكم',
    
    // Hero Section
    donateNow: 'تبرع الآن',
    
    // Programs
    programsTitle: 'مشاريعنا',
    programsSubtitle: 'ساهم في الخير',
    viewAllPrograms: 'عرض جميع المشاريع',
    raised: 'تم جمع',
    target: 'الهدف',
    contribute: 'ساهم الآن',
    
    // News
    newsTitle: 'الأخبار',
    latestNews: 'آخر الأخبار',
    breakingNews: 'عاجل',
    readMore: 'اقرأ المزيد',
    
    // Vision/Mission
    ourMission: 'رسالتنا',
    ourVision: 'رؤيتنا',
    visionTitle: 'نصنع الأمل ونبني المستقبل',
    visionDescription: 'نؤمن بأن الخير موجود في كل مكان، ومهمتنا هي إيصاله لمستحقيه بأمانة وشفافية. نسعى لتمكين المجتمعات الفقيرة وتوفير حياة كريمة للأيتام والأرامل والمحتاجين.',
    transparency: 'شفافية تامة في جميع التعاملات',
    professionalTeam: 'فريق عمل متخصص ومحترف',
    globalReach: 'وصول عالمي للمناطق الأكثر احتياجاً',
    
    // Contact
    contactTitle: 'تواصل معنا',
    contactDescription: 'نسعد باستقبال استفساراتكم واقتراحاتكم. فريقنا جاهز للرد عليكم في أقرب وقت.',
    mainLocation: 'الموقع الرئيسي',
    workingHours: 'ساعات العمل',
    workingHoursValue: 'الأحد - الخميس: 9ص - 5م',
    yourName: 'اسمك',
    yourEmail: 'بريدك الإلكتروني',
    subject: 'الموضوع',
    message: 'رسالتك',
    send: 'إرسال',
    sending: 'جاري الإرسال...',
    messageSent: 'تم إرسال رسالتك بنجاح!',
    messageError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    
    // Footer
    aboutUs: 'عن الجمعية',
    aboutDescription: 'جمعية خيرية تهدف إلى مساعدة المحتاجين وتوفير حياة كريمة للأيتام والأرامل في جميع أنحاء العالم.',
    quickLinks: 'روابط سريعة',
    followUs: 'تابعنا',
    copyright: '© 2024 جمعية الخير. جميع الحقوق محفوظة.',
    
    // Categories
    socialCare: 'رعاية اجتماعية',
    mosques: 'مساجد',
    waterSupply: 'سقيا الماء',
    relief: 'إغاثة',
    feeding: 'إطعام',
    education: 'تعليم',
  },
  
  en: {
    // Navigation
    home: 'Home',
    about: 'About Us',
    programs: 'Programs',
    news: 'News',
    contact: 'Contact',
    admin: 'Admin',
    
    // Hero Section
    donateNow: 'Donate Now',
    
    // Programs
    programsTitle: 'Our Programs',
    programsSubtitle: 'Contribute to Good',
    viewAllPrograms: 'View All Programs',
    raised: 'Raised',
    target: 'Target',
    contribute: 'Contribute Now',
    
    // News
    newsTitle: 'News',
    latestNews: 'Latest News',
    breakingNews: 'Breaking',
    readMore: 'Read More',
    
    // Vision/Mission
    ourMission: 'Our Mission',
    ourVision: 'Our Vision',
    visionTitle: 'Building Hope and Creating a Better Future',
    visionDescription: 'We believe that goodness exists everywhere, and our mission is to deliver it to those who deserve it with honesty and transparency. We strive to empower poor communities and provide a dignified life for orphans, widows, and those in need.',
    transparency: 'Complete transparency in all dealings',
    professionalTeam: 'Specialized and professional work team',
    globalReach: 'Global reach to the most needy areas',
    
    // Contact
    contactTitle: 'Contact Us',
    contactDescription: 'We are happy to receive your inquiries and suggestions. Our team is ready to respond to you as soon as possible.',
    mainLocation: 'Main Location',
    workingHours: 'Working Hours',
    workingHoursValue: 'Sunday - Thursday: 9 AM - 5 PM',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    subject: 'Subject',
    message: 'Your Message',
    send: 'Send',
    sending: 'Sending...',
    messageSent: 'Your message has been sent successfully!',
    messageError: 'An error occurred. Please try again.',
    
    // Footer
    aboutUs: 'About Us',
    aboutDescription: 'A charity organization dedicated to helping those in need and providing a dignified life for orphans and widows around the world.',
    quickLinks: 'Quick Links',
    followUs: 'Follow Us',
    copyright: '© 2024 Al-Khair Charity. All rights reserved.',
    
    // Categories
    socialCare: 'Social Care',
    mosques: 'Mosques',
    waterSupply: 'Water Supply',
    relief: 'Relief',
    feeding: 'Feeding',
    education: 'Education',
  },
};

export function getTranslation(lang: Language, key: keyof typeof translations.en): string {
  return translations[lang][key] || translations[defaultLanguage][key] || key;
}

export function isRTL(lang: Language): boolean {
  return lang === 'ar';
}

