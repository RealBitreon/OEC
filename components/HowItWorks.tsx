export default function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="11" cy="11" r="3" fill="currentColor" opacity="0.3"/>
        </svg>
      ),
      title: 'ابحث في الموسوعة',
      description: 'استخدم الموسوعة العُمانية للبحث عن إجابات الأسئلة المطروحة'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'اكتب الإجابة + التوثيق',
      description: 'سجّل الإجابة مع التوثيق الدقيق: الجزء/الصفحة/السطر'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 9H15M9 13H15M9 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.3"/>
        </svg>
      ),
      title: 'اجمع التذاكر',
      description: 'كل إجابة صحيحة موثّقة = تذاكر أكثر للدخول في السحب'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2V12L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
        </svg>
      ),
      title: 'تابع السحب',
      description: 'شاهد السحب المباشر وتعرّف على الفائزين في الوقت المحدد'
    }
  ]

  return (
    <section className="py-24 bg-neutral-50">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-primary mb-4">كيف تعمل المسابقة؟</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            أربع خطوات بسيطة للمشاركة والفوز
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="card text-center group hover:border-2 hover:border-primary/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Number */}
              <div className="absolute top-4 left-4 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">{index + 1}</span>
              </div>

              {/* Icon */}
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300 text-primary">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-primary mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-neutral-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
