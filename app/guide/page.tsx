'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import StartCompetitionButton from '@/components/StartCompetitionButton'
import Icons from '@/components/icons'

export default function GuidePage() {
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
            <div className="md:text-8xl mb-4 md:mb-6"><Icons.file className="w-16 h-16" /></div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              دليل إجابة الطالب
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto px-4">
              مسابقة الموسوعة العُمانية 🇴🇲
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-6 md:py-8 bg-secondary/10 border-y-2 border-secondary/30">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-2 border-secondary"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="md:text-4xl"><Icons.target className="w-8 h-8" /></div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-2">الهدف من الدليل</h3>
                <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
                  يساعدك تجاوب إجابة دقيقة، صحيحة، ومختصرة من غير إطالة ولا خروج عن المطلوب.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Guide Content */}
      <section className="py-8 md:py-16 flex-1">
        <div className="section-container">
          <div className="space-y-6 md:space-y-8">

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-blue-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
                    قبل ما تجاوب
                  </h2>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 md:p-6">
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 text-2xl flex-shrink-0">📖</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">اقرأ السؤال مرتين بهدوء</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.target className="w-6 h-6 text-blue-500  flex-shrink-0" />
                    <div className="flex-1">
                      <strong className="text-sm md:text-base text-neutral-800">حدّد المطلوب إيش بالضبط؟</strong>
                      <div className="mr-6 mt-2 text-neutral-600 text-sm">
                        (تعريف؟ سبب؟ نتيجة؟ مثال؟)
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.warning className="w-6 h-6 text-blue-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">لا تجاوب من راسك إذا السؤال من الموسوعة</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-green-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
                    طريقة الإجابة الصحيحة
                  </h2>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-2xl flex-shrink-0">✓</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">جاوب بنفس فكرة السؤال</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-2xl flex-shrink-0">✓</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">استخدم كلمات واضحة وبسيطة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-2xl flex-shrink-0">✓</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">جملة أو جملتين كفاية</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 md:p-6 border-2 border-green-200 mb-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-green-300">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Icons.check className="w-5 h-5 text-xl md: flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-800 text-xs md:text-sm mb-1">مثال صحيح:</p>
                      <p className="text-sm md:text-base text-neutral-800 mb-1"><strong>السؤال:</strong> ما سبب …؟</p>
                      <p className="text-sm md:text-base text-green-700"><strong>الإجابة:</strong> السبب هو … لأنه …</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-300">
                <div className="flex items-start gap-2 md:gap-3">
                  <Icons.cross className="w-5 h-5 text-xl md: flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 text-xs md:text-sm mb-2">خطأ:</p>
                    <ul className="space-y-1 text-sm md:text-base text-neutral-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">●</span>
                        <span>شرح طويل</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">●</span>
                        <span>معلومات زيادة ما مطلوبة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">●</span>
                        <span>رأي شخصي</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-yellow-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
                    لا تزيد ولا تنقص
                  </h2>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 md:p-6">
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <Icons.zap className="w-6 h-6 text-yellow-600  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">لا تضيف معلومات من خارج السؤال</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.zap className="w-6 h-6 text-yellow-600  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">لا تحذف نقطة أساسية</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.zap className="w-6 h-6 text-yellow-600  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">إذا السؤال طالب سبب واحد → لا تذكر سببين</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.zap className="w-6 h-6 text-yellow-600  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">إذا طالب تعريف → لا تحوّله لشرح</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-purple-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
                    اللغة والأسلوب
                  </h2>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 md:p-6 mb-4">
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <Icons.message className="w-6 h-6 text-purple-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">استخدم لغة سهلة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.message className="w-6 h-6 text-purple-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">لا تحتاج كلمات كبيرة أو معقدة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.message className="w-6 h-6 text-purple-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">خلك طبيعي وكأنك تشرح لزميلك</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 md:p-6 border-2 border-purple-200">
                <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-purple-300">
                  <div className="flex items-start gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl flex-shrink-0">👍</span>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-800 text-xs md:text-sm mb-1">مثال أسلوب مناسب:</p>
                      <p className="text-sm md:text-base text-purple-700">المقصود بـ … هو …</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-red-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">5</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
                    إذا ما كنت متأكد
                  </h2>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 md:p-6">
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <Icons.book className="w-6 h-6 text-red-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">ارجع للموسوعة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-2xl flex-shrink-0">🚫</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">لا تخمّن</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-2xl flex-shrink-0">🚫</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">لا تكتب "أعتقد" أو "يمكن"</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Step 6 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-indigo-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">6</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
                    في أسئلة الاختيار أو الصح والخطأ
                  </h2>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 md:p-6">
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-500 text-2xl flex-shrink-0">👀</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">اقرأ كل الخيارات</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-500 text-2xl flex-shrink-0">⏱️</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">لا تستعجل</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.sparkles className="w-6 h-6 text-indigo-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">اختر الأوضح والأدق</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Step 7 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-orange-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0">7</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
                    تذكير مهم
                  </h2>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 md:p-6">
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <Icons.lightbulb className="w-6 h-6 text-orange-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">المطلوب إجابة صحيحة مش أطول إجابة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 text-2xl flex-shrink-0">💪</span>
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">الاختصار قوة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icons.target className="w-6 h-6 text-orange-500  flex-shrink-0" />
                    <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">الدقة أهم من الكثرة</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Final Message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="card bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 text-center"
            >
              <div className="md:text-6xl mb-4 md:mb-6"><Icons.star className="w-12 h-12" /></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
                كلمة أخيرة
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 leading-relaxed mb-2">
                جاوب بثقة وخلك ملتزم بالسؤال
              </p>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 leading-relaxed">
                وترى المشاركة بحد ذاتها إنجاز
              </p>
              <p className="text-4xl mt-4">🇴🇲✨</p>
            </motion.div>

            {/* Quick Tips Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="card bg-gradient-to-br from-blue-50 to-primary/5 border-2 border-blue-200"
            >
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
                <Icons.pin className="w-6 h-6 md:text-3xl" />
                نصائح سريعة
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-green-200">
                  <p className="font-semibold text-green-600 mb-3 text-base md:text-lg flex items-center gap-2">
                    <Icons.check className="w-5 h-5 text-xl md:" />
                    افعل
                  </p>
                  <ul className="space-y-2 text-sm md:text-base text-neutral-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0">●</span>
                      <span>اقرأ بتركيز</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0">●</span>
                      <span>جاوب بدقة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0">●</span>
                      <span>اختصر</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0">●</span>
                      <span>راجع إجابتك</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-red-200">
                  <p className="font-semibold text-red-600 mb-3 text-base md:text-lg flex items-center gap-2">
                    <Icons.cross className="w-5 h-5 text-xl md:" />
                    لا تفعل
                  </p>
                  <ul className="space-y-2 text-sm md:text-base text-neutral-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0">●</span>
                      <span>تستعجل</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0">●</span>
                      <span>تطوّل</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0">●</span>
                      <span>تخمّن</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0">●</span>
                      <span>تضيف معلومات زيادة</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 md:mt-12 text-center"
          >
            <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
              <div className="text-5xl md:text-6xl mb-4 md:mb-6">🎉</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
                جاهز للمشاركة؟
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-6 md:mb-8 max-w-2xl mx-auto">
                الآن بعد أن فهمت كيف تجاوب بشكل صحيح، حان وقت البدء!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <StartCompetitionButton className="btn-primary" />
                <Link href="/" className="btn-ghost">
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
