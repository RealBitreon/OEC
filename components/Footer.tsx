import Link from 'next/link'
import { config } from '@/lib/config/site'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8 mt-auto">
      <div className="section-container">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-dark">م</span>
              </div>
              <div>
                <div className="text-lg font-bold">{config.site.title}</div>
                <div className="text-xs text-white/70">{config.school.shortName}</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {config.site.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/questions" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  الأسئلة
                </Link>
              </li>
              <li>
                <Link href="/wheel" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  عجلة الحظ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  عن المسابقة
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4">المساعدة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/guide" className="text-white/70 hover:text-secondary transition-colors text-sm flex items-center gap-2 group">
                  <span className="text-secondary group-hover:scale-110 transition-transform">📖</span>
                  دليل إجابة الطالب
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  القواعد والشروط
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22 20.4696 21.5523 20.9167 21.0025 20.9167C10.0025 20.9167 1 11.9142 1 0.916667C1 0.367059 1.44772 -0.0833333 2 -0.0833333H5C5.55228 -0.0833333 6 0.367059 6 0.916667C6 2.01667 6.12 3.08667 6.35 4.11667C6.45 4.58667 6.31 5.08667 5.97 5.42667L4.09 7.30667C5.57 10.2267 7.77 12.4267 10.69 13.9067L12.57 12.0267C12.91 11.6867 13.41 11.5467 13.88 11.6467C14.91 11.8767 15.98 11.9967 17.08 11.9967C17.6323 11.9967 18.08 12.4441 18.08 12.9967V15.9967C18.08 16.5463 17.6323 16.9933 17.08 16.9933C17.08 16.9933 22 16.92 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span dir="ltr">{config.school.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <span>{config.school.address}</span>
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                <div>
                  <p className="font-medium text-white mb-1">للاستفسار عن حساب المسابقة:</p>
                  <p className="text-xs leading-relaxed">{config.contact.method}</p>
                  <p className="text-xs mt-2 text-secondary font-medium">أستاذ المصادر: {config.contact.lrcTeacher}</p>
                </div>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              {config.social.instagram && (
                <a href={config.social.instagram} className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18" cy="6" r="1" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {config.social.twitter && (
                <a href={config.social.twitter} className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="Twitter/X" target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {config.social.threads && (
                <a href={config.social.threads} className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="Threads" target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.186 3.998c-2.917 0-5.184 1.51-6.326 3.896l1.846.768c.85-1.776 2.363-2.664 4.48-2.664 1.595 0 2.888.515 3.741 1.49.853.975 1.28 2.337 1.28 4.086v.344c-1.024-.427-2.176-.64-3.456-.64-2.133 0-3.84.597-5.12 1.792-1.28 1.195-1.92 2.795-1.92 4.8 0 1.963.64 3.541 1.92 4.736 1.28 1.195 2.987 1.792 5.12 1.792 2.347 0 4.16-.768 5.44-2.304v1.92h2.304V11.214c0-2.347-.64-4.16-1.92-5.44-1.28-1.28-3.093-1.92-5.44-1.92zm.128 15.36c-1.493 0-2.645-.384-3.456-1.152-.81-.768-1.216-1.792-1.216-3.072 0-1.28.405-2.304 1.216-3.072.81-.768 1.963-1.152 3.456-1.152 1.493 0 2.645.384 3.456 1.152.81.768 1.216 1.792 1.216 3.072 0 1.28-.405 2.304-1.216 3.072-.81.768-1.963 1.152-3.456 1.152z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <div>
              © {currentYear} {config.site.title}. جميع الحقوق محفوظة.
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-secondary transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="hover:text-secondary transition-colors">
                الشروط والأحكام
              </Link>
            </div>
          </div>
          
          {/* School & Developer Credit */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-white/50">
              مبادرة من مركز مصادر التعلم - {config.school.name}
            </p>
            <p className="text-xs text-white/40">
              تطوير الطالب {config.developer.name} - الصف {config.developer.grade}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
