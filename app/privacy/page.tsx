'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'

export default function PrivacyPage() {
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
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">🔒</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              سياسة الخصوصية
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto px-4">
              نحن نحترم خصوصيتك ونحمي بياناتك
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-16 flex-1">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            {/* Last Updated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mb-8 md:mb-12"
            >
              <p className="text-sm md:text-base text-blue-800">
                <strong>آخر تحديث:</strong> يناير 2026
              </p>
            </motion.div>

            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card mb-6 md:mb-8"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">
                مرحباً بك عزيزي الطالب! 👋
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed mb-4">
                نحن في مسابقة الموسوعة العُمانية نهتم بخصوصيتك وحماية معلوماتك الشخصية. هذه الصفحة تشرح لك بلغة بسيطة كيف نجمع معلوماتك، ولماذا نحتاجها، وكيف نحميها.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed">
                لا تقلق! نحن لا نشارك معلوماتك مع أي جهة خارجية، ونستخدمها فقط لإدارة المسابقة.
              </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-6 md:space-y-8">
              {/* Section 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">📝</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      1. ما هي المعلومات التي نجمعها؟
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      عندما تشارك في المسابقة، نطلب منك المعلومات التالية:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700"><strong>الاسم الكامل:</strong> لنعرف من أنت ونتواصل معك</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700"><strong>الصف الدراسي:</strong> للتأكد من أنك مؤهل للمشاركة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700"><strong>البريد الإلكتروني:</strong> للتواصل معك وإرسال التحديثات</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700"><strong>إجاباتك:</strong> لتقييمها ومنحك التذاكر</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Section 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">🎯</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      2. لماذا نحتاج هذه المعلومات؟
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      نستخدم معلوماتك فقط لهذه الأغراض:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">إدارة مشاركتك في المسابقة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">تقييم إجاباتك ومنحك التذاكر</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">التواصل معك بخصوص المسابقة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">إعلامك إذا فزت في السحب</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">تحسين المسابقة في المستقبل</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Section 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">🔐</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      3. كيف نحمي معلوماتك؟
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      نأخذ حماية معلوماتك على محمل الجد:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">نحفظ معلوماتك في نظام آمن ومحمي</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">فقط المعلمون المسؤولون يمكنهم الوصول إلى معلوماتك</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">لا نشارك معلوماتك مع أي جهة خارجية</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">نحذف معلوماتك بعد انتهاء المسابقة (إلا إذا طلبت الاحتفاظ بها)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Section 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">👨‍👩‍👧‍👦</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      4. دور ولي الأمر
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      نحترم حقوق أولياء الأمور:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">يمكن لولي الأمر الاطلاع على معلومات ابنه/ابنته</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">يمكن لولي الأمر طلب حذف معلومات ابنه/ابنته</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">يمكن لولي الأمر الاعتراض على استخدام معلومات ابنه/ابنته</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Section 5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">✅</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      5. حقوقك
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      لديك الحق في:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">معرفة ما هي المعلومات التي نحتفظ بها عنك</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">طلب تصحيح معلوماتك إذا كانت خاطئة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">طلب حذف معلوماتك في أي وقت</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">الانسحاب من المسابقة في أي وقت</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Section 6 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">🍪</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      6. ملفات تعريف الارتباط (Cookies)
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
                      نستخدم ملفات تعريف الارتباط البسيطة لتحسين تجربتك في الموقع. هذه الملفات تساعدنا على تذكر تسجيل دخولك وتفضيلاتك. لا نستخدمها لتتبعك أو جمع معلومات شخصية إضافية.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 md:mt-12"
            >
              <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl mb-4 md:mb-6">📞</div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
                    هل لديك أسئلة؟
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-neutral-700 mb-6 md:mb-8">
                    إذا كان لديك أي سؤال عن سياسة الخصوصية أو كيفية استخدام معلوماتك، لا تتردد في التواصل معنا
                  </p>
                  <Link href="/contact" className="btn-primary inline-block">
                    تواصل معنا
                  </Link>
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
