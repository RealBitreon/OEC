'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import { config } from '@/lib/config/site'
import Icons from '@/components/icons'

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
            <div className="flex justify-center mb-4 md:mb-6">
              <Icons.phone className="w-24 h-24 md:w-32 md:h-32 text-white" strokeWidth={1.5} />
            </div>
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
                      <Icons.school className="w-6 h-6 md:text-3xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        مركز مصادر التعلم
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 mb-3 leading-relaxed">
                        {config.contact.method}
                      </p>
                      <div className="space-y-2 text-sm md:text-base text-neutral-600">
                        <p>📍 الموقع: الطابق الأول، المبنى الرئيسي</p>
                        <p>🕐 أوقات العمل: من 7:30 صباحاً إلى 2:00 ظهراً</p>
                        <p>📅 الأيام: الأحد - الخميس</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email - Removed as per requirements */}

                {/* Phone */}
                <div className="card hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icons.smartphone className="w-6 h-6 md:text-3xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        الهاتف
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 mb-3">
                        اتصل بنا مباشرة
                      </p>
                      <a 
                        href={`tel:${config.school.phone.replace(/\s/g, '')}`}
                        className="text-sm md:text-base text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2 transition-colors"
                        dir="ltr"
                      >
                        {config.school.phone}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="card hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icons.location className="w-6 h-6 md:text-3xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        العنوان
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
                        {config.school.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="card hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icons.message className="w-6 h-6 md:text-3xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">
                        وسائل التواصل الاجتماعي
                      </h3>
                      <p className="text-sm md:text-base text-neutral-700 mb-4">
                        تابعنا على وسائل التواصل الاجتماعي
                      </p>
                      <div className="flex gap-3">
                        {config.social.instagram && (
                          <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary hover:bg-primary-dark rounded-lg flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="18" cy="6" r="1" fill="currentColor"/>
                            </svg>
                          </a>
                        )}
                        {config.social.twitter && (
                          <a href={config.social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary hover:bg-primary-dark rounded-lg flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                        )}
                        {config.social.threads && (
                          <a href={config.social.threads} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary hover:bg-primary-dark rounded-lg flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.186 3.998c-.944.005-1.888.102-2.816.29-1.473.298-2.778.89-3.88 1.76-1.102.87-1.97 2.01-2.58 3.39-.61 1.38-.92 2.98-.92 4.76 0 1.78.31 3.38.92 4.76.61 1.38 1.478 2.52 2.58 3.39 1.102.87 2.407 1.462 3.88 1.76.928.188 1.872.285 2.816.29.944-.005 1.888-.102 2.816-.29 1.473-.298 2.778-.89 3.88-1.76 1.102-.87 1.97-2.01 2.58-3.39.61-1.38.92-2.98.92-4.76 0-1.78-.31-3.38-.92-4.76-.61-1.38-1.478-2.52-2.58-3.39-1.102-.87-2.407-1.462-3.88-1.76-.928-.188-1.872-.285-2.816-.29zm0 1.5c.844.004 1.688.091 2.52.26 1.247.253 2.35.753 3.28 1.49.93.737 1.665 1.7 2.185 2.865.52 1.165.78 2.515.78 4.015 0 1.5-.26 2.85-.78 4.015-.52 1.165-1.255 2.128-2.185 2.865-.93.737-2.033 1.237-3.28 1.49-.832.169-1.676.256-2.52.26-.844-.004-1.688-.091-2.52-.26-1.247-.253-2.35-.753-3.28-1.49-.93-.737-1.665-1.7-2.185-2.865-.52-1.165-.78-2.515-.78-4.015 0-1.5.26-2.85.78-4.015.52-1.165 1.255-2.128 2.185-2.865.93-.737 2.033-1.237 3.28-1.49.832-.169 1.676-.256 2.52-.26z"/>
                              <path d="M16.5 11.5c-.3-1.5-1.5-2.5-3-2.5-2.2 0-3.5 1.8-3.5 4s1.3 4 3.5 4c1.5 0 2.7-1 3-2.5h-1.5c-.2.8-.9 1.5-1.5 1.5-1.4 0-2-1.2-2-3s.6-3 2-3c.6 0 1.3.7 1.5 1.5h1.5z"/>
                            </svg>
                          </a>
                        )}
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
                    <span className="text-xl"><Icons.question className="w-6 h-6" /></span>
                    <span>الأسئلة الشائعة</span>
                  </Link>
                  <Link href="/rules" className="flex items-center gap-3 text-sm md:text-base text-neutral-700 hover:text-primary transition-colors">
                    <span className="text-xl">📖</span>
                    <span>قواعد المسابقة</span>
                  </Link>
                  <Link href="/questions" className="flex items-center gap-3 text-sm md:text-base text-neutral-700 hover:text-primary transition-colors">
                    <span className="text-xl"><Icons.file className="w-6 h-6" /></span>
                    <span>الأسئلة</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Contact Form - Replaced with School Staff Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="card sticky top-24 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
                    فريق العمل
                  </h2>
                  <p className="text-sm md:text-base text-neutral-700">
                    تعرف على فريق العمل المسؤول عن المسابقة
                  </p>
                </div>

                {/* School Staff */}
                <div className="space-y-4">
                  {/* Principal */}
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-lg"><Icons.briefcase className="w-6 h-6" /></span>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">مدير المدرسة</p>
                        <p className="text-lg font-bold text-primary">{config.school.principal}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assistant Principal */}
                  <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border-2 border-secondary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-primary-dark text-lg"><Icons.briefcase className="w-6 h-6" /></span>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">مساعد المدير</p>
                        <p className="text-lg font-bold text-primary">{config.school.assistantPrincipal}</p>
                      </div>
                    </div>
                  </div>

                  {/* LRC Teacher */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg"><Icons.graduation className="w-6 h-6" /></span>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">أستاذ مركز مصادر التعلم</p>
                        <p className="text-lg font-bold text-primary">{config.school.lrcTeacher}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Developer Credit */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg"><Icons.code className="w-6 h-6" /></span>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">تطوير وبرمجة المنصة</p>
                      <p className="text-lg font-bold text-primary">{config.developer.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mr-[52px]">
                    طالب في الصف {config.developer.grade}
                  </p>
                </div>

                {/* School Info */}
                <div className="p-4 bg-neutral-50 rounded-xl border-2 border-neutral-200">
                  <h3 className="text-lg font-bold text-primary mb-3">معلومات المدرسة</h3>
                  <div className="space-y-2 text-sm text-neutral-700">
                    <p className="flex items-start gap-2">
                      <span className="text-lg"><Icons.school className="w-6 h-6" /></span>
                      <span className="flex-1">{config.school.name}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-lg"><Icons.location className="w-6 h-6" /></span>
                      <span className="flex-1">{config.school.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-lg"><Icons.phone className="w-6 h-6" /></span>
                      <span dir="ltr">{config.school.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Note */}
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <p className="text-xs md:text-sm text-amber-800">
                    <strong>💡 ملاحظة:</strong> للمشاركة في المسابقة أو الاستفسار عن أي معلومات، يرجى التوجه إلى مركز مصادر التعلم في المدرسة خلال أوقات الدوام الرسمي.
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
