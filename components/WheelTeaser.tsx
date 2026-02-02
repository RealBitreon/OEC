'use client'

import Link from 'next/link'

export default function WheelTeaser() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary-light relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 w-64 h-64 bg-secondary-light rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-8 animate-bounce">
            <svg className="w-32 h-32 mx-auto text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 2V22M2 12H22M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="2" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="22" r="1.5" fill="currentColor"/>
              <circle cx="2" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="22" cy="12" r="1.5" fill="currentColor"/>
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            السحب على الجوائز
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
            سيتم السحب علنًا أمام الجميع في الوقت المحدد. شاهد اللحظة المثيرة وتعرّف على الفائزين مباشرة!
          </p>

          {/* Info Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-card p-8 mb-8 inline-block border border-white/20">
            <p className="text-white/90 text-lg font-medium mb-2">🎉 السحب قريباً</p>
            <p className="text-white/70 text-base">سيتم الإعلان عن موعد السحب في المدرسة</p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <svg className="w-12 h-12 mx-auto mb-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div className="text-white font-semibold">سحب مباشر</div>
              <div className="text-white/70 text-sm mt-2">شفافية كاملة</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <svg className="w-12 h-12 mx-auto mb-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
              <div className="text-white font-semibold">عادل للجميع</div>
              <div className="text-white/70 text-sm mt-2">فرص متساوية</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <svg className="w-12 h-12 mx-auto mb-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9C6 9 6 4 12 4C18 4 18 9 18 9V13C18 13 18 18 12 18C6 18 6 13 6 13V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V22M8 22H16M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="text-white font-semibold">جوائز قيّمة</div>
              <div className="text-white/70 text-sm mt-2">للفائزين</div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/wheel"
            className="inline-block bg-secondary hover:bg-secondary-dark text-primary-dark font-bold px-12 py-5 rounded-button text-lg transition-all duration-300 hover:scale-105 shadow-xl"
          >
            افتح صفحة العجلة
          </Link>
        </div>
      </div>
    </section>
  )
}
