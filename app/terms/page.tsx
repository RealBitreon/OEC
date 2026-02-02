import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import Icons from '@/components/icons'

export default function TermsPage() {
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

          <div className="text-center">
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">📜</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              الشروط والأحكام
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto px-4">
              القواعد الأساسية للمشاركة في المسابقة
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-16 flex-1">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            {/* Last Updated */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mb-8 md:mb-12">
              <p className="text-sm md:text-base text-blue-800">
                <strong>آخر تحديث:</strong> يناير 2026
              </p>
            </div>

            {/* Introduction */}
            <div className="card mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">
                مرحباً عزيزي الطالب! 👋
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed mb-4">
                هذه الصفحة تحتوي على الشروط والأحكام الخاصة بمسابقة الموسوعة العُمانية. قد تبدو طويلة، لكنها مهمة! اقرأها بعناية لتفهم حقوقك وواجباتك.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed">
                بمشاركتك في المسابقة، أنت توافق على هذه الشروط والأحكام.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6 md:space-y-8">
              {/* Section 1 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <Icons.check className="w-8 h-8 md:text-4xl" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      1. قبول الشروط
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      بمشاركتك في المسابقة، أنت توافق على:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">الالتزام بجميع قواعد المسابقة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">احترام قرارات لجنة التحكيم</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">التصرف بأمانة ونزاهة</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">👥</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      2. الأهلية للمشاركة
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      يمكنك المشاركة إذا كنت:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">طالباً مسجلاً في المدرسة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">من الصف العاشر إلى الصف الثاني عشر</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">حصلت على موافقة ولي أمرك (للطلاب دون 18 سنة)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <Icons.file className="w-8 h-8 md:text-4xl" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      3. قواعد المشاركة
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      يجب عليك:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">البحث عن الإجابات في الموسوعة العُمانية فقط</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">توثيق المصدر بشكل صحيح (المجلد ورقم الصفحة)</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">كتابة الإجابة بأسلوبك الخاص (عدم النسخ الحرفي)</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">عدم الغش أو نسخ إجابات الآخرين</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">احترام زملائك والمعلمين</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">🎫</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      4. التذاكر والسحب
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      بخصوص التذاكر والسحب:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">كل إجابة صحيحة مع توثيق صحيح = تذكرة واحدة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">السحب عشوائي وعادل</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">قرارات السحب نهائية ولا يمكن الاعتراض عليها</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">لا يمكن نقل التذاكر أو بيعها</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <Icons.trophy className="w-8 h-8 md:text-4xl" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      5. الجوائز
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      بخصوص الجوائز:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">سيتم الإعلان عن الجوائز قبل بدء المسابقة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">الجوائز غير قابلة للاستبدال بالنقد</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">يجب استلام الجائزة خلال شهر من الفوز</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">إذا لم يتم استلام الجائزة، سيتم إعادة السحب</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <Icons.warning className="w-8 h-8 md:text-4xl" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      6. السلوك غير المقبول
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      سيتم استبعادك من المسابقة إذا:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 text-lg md:text-xl flex-shrink-0 mt-0.5">✖</span>
                        <span className="text-sm md:text-base text-neutral-700">غششت أو نسخت إجابات الآخرين</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 text-lg md:text-xl flex-shrink-0 mt-0.5">✖</span>
                        <span className="text-sm md:text-base text-neutral-700">استخدمت مصادر غير الموسوعة العُمانية</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 text-lg md:text-xl flex-shrink-0 mt-0.5">✖</span>
                        <span className="text-sm md:text-base text-neutral-700">أرسلت إجابات مسيئة أو غير لائقة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 text-lg md:text-xl flex-shrink-0 mt-0.5">✖</span>
                        <span className="text-sm md:text-base text-neutral-700">حاولت التلاعب بالنظام</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 text-lg md:text-xl flex-shrink-0 mt-0.5">✖</span>
                        <span className="text-sm md:text-base text-neutral-700">أساءت لزملائك أو المعلمين</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 7 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span className="text-3xl md:text-4xl">🔄</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      7. التغييرات والإلغاء
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      نحتفظ بالحق في:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">تعديل قواعد المسابقة في أي وقت</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">تأجيل أو إلغاء المسابقة لأسباب خارجة عن إرادتنا</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">استبعاد أي مشارك يخالف القواعد</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">اتخاذ القرار النهائي في أي نزاع</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 8 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <Icons.scale className="w-8 h-8 md:text-4xl" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      8. المسؤولية
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed mb-4">
                      يرجى العلم أن:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">المدرسة غير مسؤولة عن أي مشاكل تقنية</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">المشاركة على مسؤوليتك الخاصة</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700">يجب الحصول على موافقة ولي الأمر</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 9 */}
              <div className="card">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <Icons.phone className="w-8 h-8 md:text-4xl" />
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 md:mb-4">
                      9. الاتصال
                    </h3>
                    <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
                      إذا كان لديك أي سؤال عن هذه الشروط والأحكام، يرجى التواصل معنا عبر مركز مصادر التعلم أو صفحة "تواصل معنا".
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agreement Section */}
            <div className="mt-8 md:mt-12">
              <div className="card bg-gradient-to-br from-green-50 to-primary/5 border-2 border-green-200">
                <div className="text-center">
                  <div className="md:text-6xl mb-4 md:mb-6"><Icons.check className="w-12 h-12" /></div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 md:mb-4">
                    هل توافق على الشروط؟
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-neutral-700 mb-6 md:mb-8">
                    بمشاركتك في المسابقة، أنت توافق على جميع الشروط والأحكام المذكورة أعلاه
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/participate" className="btn-primary">
                      أوافق وأريد المشاركة
                    </Link>
                    <Link href="/rules" className="btn-ghost">
                      اقرأ القواعد أولاً
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
