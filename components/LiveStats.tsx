'use client'

export default function LiveStats() {
  const stats = {
    todayParticipations: 0,
    totalTickets: 0,
    drawTime: 'قريباً'
  }

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">إحصائيات المسابقة</h2>
          <p className="text-lg text-neutral-600">تابع أرقام المسابقة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Today's Participations */}
          <div className="card text-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
            <svg className="w-16 h-16 mx-auto mb-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="16" r="2" fill="currentColor"/>
              <circle cx="12" cy="11" r="2" fill="currentColor"/>
              <circle cx="16" cy="15" r="2" fill="currentColor"/>
            </svg>
            <div className="text-5xl font-bold text-primary mb-2">
              {stats.todayParticipations}
            </div>
            <div className="text-lg font-semibold text-neutral-700">مشاركة اليوم</div>
            <div className="text-sm text-neutral-500 mt-2">سيتم التحديث قريباً</div>
          </div>

          {/* Total Tickets */}
          <div className="card text-center bg-gradient-to-br from-secondary/20 to-secondary/30 border-2 border-secondary/40">
            <svg className="w-16 h-16 mx-auto mb-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 10H21M3 14H21" stroke="currentColor" strokeWidth="2"/>
              <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            <div className="text-5xl font-bold text-primary mb-2">
              {stats.totalTickets.toLocaleString('ar-EG')}
            </div>
            <div className="text-lg font-semibold text-neutral-700">إجمالي التذاكر</div>
            <div className="text-sm text-neutral-500 mt-2">جميع المشاركين</div>
          </div>

          {/* Draw Time */}
          <div className="card text-center bg-gradient-to-br from-primary-dark/10 to-primary/10 border-2 border-primary/20">
            <svg className="w-16 h-16 mx-auto mb-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
            <div className="text-3xl font-bold text-primary mb-2">
              {stats.drawTime}
            </div>
            <div className="text-lg font-semibold text-neutral-700">وقت السحب</div>
            <div className="text-sm text-neutral-500 mt-2">سيتم الإعلان عنه</div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-neutral-100 rounded-full px-6 py-3">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-primary">✓</span> هذه المسابقة تهدف إلى تعزيز مهارات البحث والتوثيق
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
