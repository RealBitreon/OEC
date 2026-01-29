'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light pt-24 md:pt-32 pb-12 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-48 h-48 md:w-96 md:h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 md:w-96 md:h-96 bg-secondary-light rounded-full blur-3xl"></div>
        </div>

        <div className="section-container relative z-10">
          <div className="mb-4 md:mb-6">
            <BackButton 
              fallbackUrl="/"
              label="العودة للرئيسية"
              className="text-white/80 hover:text-white text-sm font-medium"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">📞</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              تواصل معنا
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto px-4">
              نحن هنا لمساعدتك! تواصل معنا في أي وقت
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-8 md:py-16 flex-1">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 md:space-y-8"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">
                  معلومات الاتصال
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed">
                  يسعدنا تواصلك معنا! إذا كان لديك أي سؤال أو استفسار عن المسابقة، لا تتردد في التواصل معنا عبر أي من الطرق التالية:
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4 md:space-y-6">
                {/* Learning Resource Center */}
                <div className="card hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl md:text-3xl">🏫</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        مركز مصادر التعلم
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 mb-3">
                        قم بزيارتنا في مركز مصادر التعلم بالمدرسة
                      </p>
                      <div className="space-y-2 text-sm md:text-base text-neutral-600">
                        <p>📍 الموقع: الطابق الأول، المبنى الرئيسي</p>
                        <p>🕐 أوقات العمل: من 7:30 صباحاً إلى 2:00 ظهراً</p>
                        <p>📅 الأيام: الأحد - الخميس</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="card hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl md:text-3xl">📧</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        البريد الإلكتروني
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 mb-3">
                        راسلنا عبر البريد الإلكتروني
                      </p>
                      <a 
                        href="mailto:lrc@school.edu.om"
                        className="text-sm md:text-base text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2 transition-colors"
                      >
                        lrc@school.edu.om
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="card hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl md:text-3xl">📱</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        الهاتف
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 mb-3">
                        اتصل بنا مباشرة
                      </p>
                      <a 
                        href="tel:+96812345678"
                        className="text-sm md:text-base text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2 transition-colors"
                        dir="ltr"
                      >
                        +968 1234 5678
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="card hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl md:text-3xl">💬</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        وسائل التواصل الاجتماعي
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 mb-4">
                        تابعنا على وسائل التواصل الاجتماعي
                      </p>
                      <div className="flex gap-3">
                        <a href="#" className="w-10 h-10 bg-primary hover:bg-primary-dark rounded-lg flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                        <a href="#" className="w-10 h-10 bg-primary hover:bg-primary-dark rounded-lg flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="18" cy="6" r="1" fill="currentColor"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card bg-gradient-to-br from-secondary/10 to-primary/5 border-2 border-secondary/30">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-4">
                  روابط مفيدة
                </h3>
                <div className="space-y-3">
                  <Link href="/faq" className="flex items-center gap-3 text-sm md:text-base text-neutral-700 hover:text-primary transition-colors">
                    <span className="text-xl">❓</span>
                    <span>الأسئلة الشائعة</span>
                  </Link>
                  <Link href="/rules" className="flex items-center gap-3 text-sm md:text-base text-neutral-700 hover:text-primary transition-colors">
                    <span className="text-xl">📖</span>
                    <span>قواعد المسابقة</span>
                  </Link>
                  <Link href="/questions" className="flex items-center gap-3 text-sm md:text-base text-neutral-700 hover:text-primary transition-colors">
                    <span className="text-xl">📝</span>
                    <span>الأسئلة</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="card sticky top-24">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">
                  أرسل رسالة
                </h2>
                <p className="text-sm md:text-base text-neutral-700 mb-6 md:mb-8">
                  املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن
                </p>

                <form className="space-y-4 md:space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-neutral-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسمك الكامل"
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none text-sm md:text-base transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-neutral-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none text-sm md:text-base transition-colors"
                    />
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-neutral-700 mb-2">
                      الصف الدراسي *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none text-sm md:text-base transition-colors"
                    >
                      <option value="">اختر الصف</option>
                      <option value="10">الصف العاشر</option>
                      <option value="11">الصف الحادي عشر</option>
                      <option value="12">الصف الثاني عشر</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-neutral-700 mb-2">
                      الموضوع *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none text-sm md:text-base transition-colors"
                    >
                      <option value="">اختر الموضوع</option>
                      <option value="question">سؤال عن المسابقة</option>
                      <option value="technical">مشكلة تقنية</option>
                      <option value="answer">استفسار عن إجابة</option>
                      <option value="tickets">استفسار عن التذاكر</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-neutral-700 mb-2">
                      الرسالة *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="اكتب رسالتك هنا..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary focus:outline-none text-sm md:text-base transition-colors resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <span>إرسال الرسالة</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </form>

                {/* Note */}
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-xs md:text-sm text-blue-800">
                    <strong>ملاحظة:</strong> سنرد على رسالتك خلال 24-48 ساعة. إذا كان استفسارك عاجلاً، يرجى زيارة مركز مصادر التعلم مباشرة.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
