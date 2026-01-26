import Link from 'next/link'

export default function RulesBanner() {
  return (
    <section className="py-24 bg-gradient-to-l from-primary-dark to-primary">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-secondary text-primary-dark px-4 py-2 rounded-full text-sm font-bold mb-6">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.3"/>
                <path d="M12 9V13M12 17H12.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              مهم جداً
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              التوثيق إلزامي لضمان العدالة
            </h2>
            <p className="text-xl text-white/90 mb-4 leading-relaxed">
              نحرص على نزاهة المسابقة من خلال التوثيق الدقيق لكل إجابة
            </p>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              المسابقة مخصصة لطلاب الصفوف 10، 11، و12 فقط في مدرسة الإمام المهنا (مدرسة بنين) بمسقط، سلطنة عُمان
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <div className="font-semibold mb-1">اكتب: الجزء + الصفحة + السطر/نطاق السطر</div>
                  <div className="text-white/80 text-sm">مثال: الجزء الثاني، ص 145، س 12-15</div>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <div className="font-semibold mb-1">قد نطلب دليل/صورة عند المراجعة</div>
                  <div className="text-white/80 text-sm">احتفظ بمصدرك جاهزاً للتحقق</div>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.3"/>
                </svg>
                <div>
                  <div className="font-semibold mb-1">أي توثيق غير صحيح يُلغي التذكرة</div>
                  <div className="text-white/80 text-sm">الدقة مطلوبة لضمان فرص متساوية للجميع</div>
                </div>
              </div>
            </div>

            <Link
              href="/rules"
              className="inline-block bg-secondary hover:bg-secondary-dark text-primary-dark font-bold px-8 py-4 rounded-button transition-all duration-300 hover:scale-105"
            >
              اقرأ القواعد كاملة
            </Link>
          </div>

          {/* Visual Element */}
          <div className="relative hidden lg:block">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-card p-8 border-2 border-white/20">
              <div className="bg-white rounded-xl p-8 shadow-2xl">
                <div className="text-primary-dark">
                  <div className="text-sm font-semibold text-neutral-500 mb-2">مثال على التوثيق الصحيح:</div>
                  <div className="bg-neutral-50 rounded-lg p-6 border-2 border-primary/20">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600 font-medium">الجزء:</span>
                        <span className="font-bold text-primary">الثاني</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600 font-medium">الصفحة:</span>
                        <span className="font-bold text-primary">145</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600 font-medium">السطر:</span>
                        <span className="font-bold text-primary">12-15</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-semibold">توثيق صحيح</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
