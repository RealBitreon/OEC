import Link from 'next/link'
import CompetitionCountdown from './home/CompetitionCountdown'

interface Competition {
  slug: string
  title: string
  endAt: string
  startAt: string
}

export default function Hero({ activeCompetition }: { activeCompetition: Competition | null }) {
  // Check if competition has ended
  const isEnded = activeCompetition ? new Date(activeCompetition.endAt).getTime() < Date.now() : false
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light pt-32 md:pt-36 pb-16 md:pb-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 md:top-20 right-10 md:right-20 w-48 h-48 md:w-96 md:h-96 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 md:bottom-20 left-10 md:left-20 w-48 h-48 md:w-96 md:h-96 bg-secondary-light rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Elements - Hidden on mobile */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute top-1/4 right-10 w-32 h-32 border-4 border-secondary/30 rounded-card rotate-12"></div>
        <div className="absolute bottom-1/4 left-10 w-24 h-24 border-4 border-secondary/20 rounded-full"></div>
      </div>

      <div className="section-container relative z-10 py-8 md:py-0">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-4 md:mb-6 animate-fade-in-up leading-tight px-4">
            مسابقة الموسوعة العُمانية
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-4 md:mb-6 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in-up px-4" style={{ animationDelay: '0.2s' }}>
            ابحث في الموسوعة… وثّق المصدر… واجمع فرصك للدخول في السحب
          </p>

          {/* Eligibility Badge */}
          <div className="flex justify-center mb-8 md:mb-12 animate-fade-in-up px-4" style={{ animationDelay: '0.3s' }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="text-white/90 text-sm md:text-base font-semibold">
                للصفوف 10-12 • مدرسة الإمام المهنا • مسقط
              </span>
            </div>
          </div>

          {/* Active Competition Section */}
          {activeCompetition && !isEnded ? (
            <>
              {/* Primary CTA */}
              <div className="mb-8 md:mb-12 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
                <Link
                  href={`/competition/${activeCompetition.slug}/participate`}
                  className="inline-block bg-secondary hover:bg-secondary-dark text-primary-dark font-bold px-8 py-4 md:px-12 md:py-6 rounded-button text-lg md:text-2xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  انضم للمسابقة الآن
                </Link>
                <p className="text-white/80 text-sm md:text-base mt-3 font-medium">
                  المسابقة النشطة: {activeCompetition.title}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
                <CompetitionCountdown endAt={activeCompetition.endAt} />
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-16 animate-fade-in-up px-4" style={{ animationDelay: '0.6s' }}>
                <Link
                  href={`/competition/${activeCompetition.slug}/participate`}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-6 py-3 md:px-8 md:py-4 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 inline-block"
                >
                  شارك
                </Link>
                <Link
                  href="/wheel"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-6 py-3 md:px-8 md:py-4 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 inline-block"
                >
                  شاهد عجلة الحظ
                </Link>
                <Link
                  href="/rules"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-6 py-3 md:px-8 md:py-4 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 inline-block"
                >
                  اقرأ القواعد
                </Link>
              </div>
            </>
          ) : activeCompetition && isEnded ? (
            <>
              {/* Competition Ended State */}
              <div className="mb-8 md:mb-12 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
                <div className="inline-block bg-white/10 backdrop-blur-md rounded-card p-6 md:p-8 border border-white/20">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    انتهت المسابقة
                  </div>
                  <p className="text-white/70 text-base md:text-lg">
                    {activeCompetition.title}
                  </p>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-16 animate-fade-in-up px-4" style={{ animationDelay: '0.5s' }}>
                <Link
                  href="/wheel"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-6 py-3 md:px-8 md:py-4 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 inline-block"
                >
                  شاهد عجلة الحظ
                </Link>
                <Link
                  href="/rules"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-6 py-3 md:px-8 md:py-4 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 inline-block"
                >
                  اقرأ القواعد
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* No Active Competition - Empty State */}
              <div className="mb-8 md:mb-12 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
                <div className="inline-block bg-white/10 backdrop-blur-md rounded-card p-6 md:p-8 border border-white/20 max-w-2xl">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    لا توجد مسابقة نشطة حالياً
                  </h3>
                  <p className="text-white/80 text-base md:text-lg">
                    تابعنا قريباً للإعلان عن مسابقة جديدة.
                  </p>
                </div>
              </div>

              {/* Alternative Actions */}
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-16 animate-fade-in-up px-4" style={{ animationDelay: '0.5s' }}>
                <Link
                  href="/login"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-6 py-3 md:px-10 md:py-5 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 inline-block"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/questions"
                  className="bg-secondary hover:bg-secondary-dark text-primary-dark font-bold px-6 py-3 md:px-10 md:py-5 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-lg inline-block"
                >
                  تدرّب على الأسئلة
                </Link>
                <Link
                  href="/rules"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-6 py-3 md:px-10 md:py-5 rounded-button text-base md:text-lg transition-all duration-300 hover:scale-105 inline-block"
                >
                  اقرأ القواعد
                </Link>
              </div>
            </>
          )}

          {/* Info Card */}
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-card p-4 md:p-8 border border-white/20 animate-fade-in-up mx-4" style={{ animationDelay: '0.7s' }}>
            <p className="text-white/90 text-base md:text-lg font-medium mb-2">
              🎉 مسابقة داخلية للتميز والإبداع
            </p>
            <p className="text-white/70 text-sm md:text-base">
              طور مهاراتك في البحث والتوثيق واحصل على فرصة للفوز بجوائز قيمة
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
