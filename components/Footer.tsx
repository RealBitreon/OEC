import Link from 'next/link'

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
                <div className="text-lg font-bold">الموسوعة العُمانية</div>
                <div className="text-xs text-white/70">مسابقة البحث والتوثيق</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              تعزيز مهارات البحث والتوثيق لدى الطلاب من خلال الموسوعة العُمانية
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
                <Link href="/rules" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  القواعد والشروط
                </Link>
              </li>
              <li>
                <Link href="/how-to-participate" className="text-white/70 hover:text-secondary transition-colors text-sm">
                  كيفية المشاركة
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
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>info@encyclopedia-om.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22 20.4696 21.5523 20.9167 21.0025 20.9167C10.0025 20.9167 1 11.9142 1 0.916667C1 0.367059 1.44772 -0.0833333 2 -0.0833333H5C5.55228 -0.0833333 6 0.367059 6 0.916667C6 2.01667 6.12 3.08667 6.35 4.11667C6.45 4.58667 6.31 5.08667 5.97 5.42667L4.09 7.30667C5.57 10.2267 7.77 12.4267 10.69 13.9067L12.57 12.0267C12.91 11.6867 13.41 11.5467 13.88 11.6467C14.91 11.8767 15.98 11.9967 17.08 11.9967C17.6323 11.9967 18.08 12.4441 18.08 12.9967V15.9967C18.08 16.5463 17.6323 16.9933 17.08 16.9933C17.08 16.9933 22 16.92 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span dir="ltr">+968 1234 5678</span>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="Twitter">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="6" r="1" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="YouTube">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <div>
              © {currentYear} مسابقة الموسوعة العُمانية. جميع الحقوق محفوظة.
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
          
          {/* School Credit */}
          <div className="text-center mt-6 text-xs text-white/50">
            <p>مبادرة من مركز مصادر التعلم - المدرسة</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
