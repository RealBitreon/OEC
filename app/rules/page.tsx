'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import StartCompetitionButton from '@/components/StartCompetitionButton'
import Icons from '@/components/icons'

export default function RulesPage() {
  const rules = [
    {
      id: 1,
      title: 'من يمكنه المشاركة؟',
      icon: '👥',
      description: 'المسابقة مفتوحة لطلاب الصفوف 10، 11، و12 فقط في مدرسة الإمام المهنا.',
      example: {
        correct: 'أحمد طالب في الصف العاشر - يمكنه المشاركة ✅',
        wrong: 'سارة طالبة في الصف التاسع - لا يمكنها المشاركة ❌'
      },
      details: [
        'يجب أن تكون طالباً مسجلاً في المدرسة',
        'يمكن للطالب المشاركة في أي وقت خلال فترة المسابقة',
        'لا يوجد حد أقصى لعدد المشاركات'
      ]
    },
    {
      id: 2,
      title: 'كيف تجيب على الأسئلة؟',
      icon: '📝',
      description: 'ابحث عن الإجابة في الموسوعة العُمانية، ثم اكتب الإجابة مع توثيق المصدر بشكل صحيح.',
      example: {
        correct: 'الإجابة: مسقط\nالمصدر: الموسوعة العُمانية، المجلد الأول، صفحة 45 ✅',
        wrong: 'الإجابة: مسقط (بدون ذكر المصدر) ❌'
      },
      details: [
        'يجب أن تكون الإجابة من الموسوعة العُمانية فقط',
        'اكتب الإجابة بشكل واضح ومختصر',
        'لا تنسخ نصوص طويلة، فقط الإجابة المطلوبة',
        'تأكد من صحة الإجابة قبل الإرسال'
      ]
    },
    {
      id: 3,
      title: 'كيف توثق المصدر؟',
      icon: '📚',
      description: 'التوثيق الصحيح هو أهم جزء في المسابقة! يجب ذكر المجلد ورقم الصفحة بدقة.',
      example: {
        correct: 'المصدر: الموسوعة العُمانية، المجلد الثاني، صفحة 127 ✅',
        wrong: 'المصدر: الموسوعة العُمانية (بدون تفاصيل) ❌'
      },
      details: [
        'اذكر اسم الموسوعة: "الموسوعة العُمانية"',
        'اذكر رقم المجلد: "المجلد الأول" أو "المجلد الثاني"',
        'اذكر رقم الصفحة بدقة: "صفحة 45"',
        'تأكد من أن المعلومة موجودة فعلاً في الصفحة المذكورة'
      ]
    },
    {
      id: 4,
      title: 'كيف تحصل على تذاكر السحب؟',
      icon: '🎫',
      description: 'كل إجابة صحيحة مع توثيق صحيح = تذكرة واحدة للسحب. كلما أجبت أكثر، زادت فرصك!',
      example: {
        correct: '5 إجابات صحيحة = 5 تذاكر = فرصة أكبر للفوز 🎉',
        wrong: '5 إجابات بدون توثيق = 0 تذاكر ❌'
      },
      details: [
        'الإجابة الصحيحة + التوثيق الصحيح = تذكرة واحدة',
        'الإجابة الصحيحة بدون توثيق = لا تحصل على تذكرة',
        'الإجابة الخاطئة = لا تحصل على تذكرة',
        'يمكنك الإجابة على جميع الأسئلة المتاحة',
        'كلما زادت تذاكرك، زادت فرصتك في الفوز'
      ]
    },
    {
      id: 5,
      title: 'متى يتم السحب؟',
      icon: '🎡',
      description: 'سيتم السحب في نهاية المسابقة باستخدام عجلة الحظ. سيتم اختيار 3 فائزين!',
      example: {
        correct: 'إذا كان لديك 10 تذاكر، سيظهر اسمك 10 مرات في العجلة ✅',
        wrong: 'إذا كان لديك تذكرة واحدة، سيظهر اسمك مرة واحدة فقط'
      },
      details: [
        'سيتم الإعلان عن موعد السحب قبل أسبوع',
        'السحب سيكون مباشراً أمام الجميع',
        'سيتم اختيار 3 فائزين (الفائز الأول، الثاني، والثالث)',
        'كل طالب لديه فرصة عادلة حسب عدد تذاكره',
        'النتائج نهائية ولا يمكن الاعتراض عليها'
      ]
    },
    {
      id: 6,
      title: 'ما هي الجوائز؟',
      icon: '🏆',
      description: 'سيحصل الفائزون الثلاثة على جوائز قيمة تشجيعاً لهم على البحث والتوثيق.',
      example: {
        correct: 'الفائز الأول: جائزة كبرى 🥇\nالفائز الثاني: جائزة ثانية 🥈\nالفائز الثالث: جائزة ثالثة 🥉',
        wrong: ''
      },
      details: [
        'سيتم الإعلان عن الجوائز قبل بدء المسابقة',
        'الجوائز قيمة ومفيدة للطلاب',
        'سيتم تسليم الجوائز في حفل خاص',
        'الفائزون سيحصلون على شهادات تقدير أيضاً'
      ]
    },
    {
      id: 7,
      title: 'ماذا لو أخطأت في الإجابة؟',
      icon: '❓',
      description: 'لا تقلق! يمكنك المحاولة مرة أخرى. الأخطاء جزء من التعلم.',
      example: {
        correct: 'أجبت خطأ على السؤال الأول؟ جرب السؤال الثاني والثالث! ✅',
        wrong: 'لا تستسلم بعد خطأ واحد ❌'
      },
      details: [
        'الإجابات الخاطئة لا تؤثر سلباً عليك',
        'يمكنك الإجابة على أسئلة أخرى',
        'تعلم من أخطائك وحاول مرة أخرى',
        'المهم هو المحاولة والتعلم'
      ]
    },
    {
      id: 8,
      title: 'هل يمكنني العمل مع زملائي؟',
      icon: '🤝',
      description: 'نعم! يمكنك مناقشة الأسئلة مع زملائك، لكن كل طالب يجب أن يرسل إجابته بنفسه.',
      example: {
        correct: 'أحمد وسارة يبحثان معاً، لكن كل واحد يكتب إجابته بنفسه ✅',
        wrong: 'أحمد ينسخ إجابة سارة بالضبط ❌'
      },
      details: [
        'التعاون في البحث مسموح ومشجع',
        'المناقشة مع الزملاء تساعد على التعلم',
        'لكن كل طالب يجب أن يكتب إجابته بأسلوبه',
        'النسخ الحرفي غير مسموح'
      ]
    },
    {
      id: 9,
      title: 'كيف أعرف أن إجابتي صحيحة؟',
      icon: '✅',
      description: 'بعد إرسال إجابتك، سيتم مراجعتها من قبل المعلمين. ستعرف عدد تذاكرك في صفحة المشاركة.',
      example: {
        correct: 'أرسلت 5 إجابات، وافقت على 4 منها = لديك 4 تذاكر ✅',
        wrong: 'أرسلت 5 إجابات، لكن لم توثق المصدر = 0 تذاكر ❌'
      },
      details: [
        'المراجعة تتم خلال 24-48 ساعة',
        'يمكنك متابعة عدد تذاكرك في أي وقت',
        'إذا رُفضت إجابة، حاول مرة أخرى',
        'تواصل مع المعلم إذا كان لديك استفسار'
      ]
    },
    {
      id: 10,
      title: 'نصائح للفوز',
      icon: '💡',
      description: 'اتبع هذه النصائح لزيادة فرصك في الفوز والاستفادة من المسابقة.',
      example: {
        correct: 'اقرأ السؤال بعناية → ابحث في الموسوعة → وثق المصدر بدقة → راجع إجابتك ✅',
        wrong: 'أجب بسرعة بدون قراءة أو توثيق ❌'
      },
      details: [
        'اقرأ السؤال بعناية وافهمه جيداً',
        'خذ وقتك في البحث، لا تتعجل',
        'تأكد من التوثيق الصحيح قبل الإرسال',
        'راجع إجابتك قبل الإرسال',
        'أجب على أكبر عدد ممكن من الأسئلة',
        'استمتع بالبحث والتعلم!'
      ]
    }
  ]

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
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">📖</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              قواعد المسابقة
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto px-4">
              اقرأ القواعد بعناية لتفهم كيف تشارك وتزيد فرصك في الفوز
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
              <div className="md:text-4xl"><Icons.warning className="w-8 h-8" /></div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-2">مهم جداً!</h3>
                <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
                  عزيزي الطالب، هذه القواعد مكتوبة لك بلغة بسيطة وواضحة. اقرأها بتمعن وستفهم كل شيء بسهولة. 
                  إذا كان لديك أي سؤال، لا تتردد في سؤال معلمك. نحن هنا لمساعدتك! 😊
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rules Content */}
      <section className="py-8 md:py-16 flex-1">
        <div className="section-container">
          <div className="space-y-6 md:space-y-8">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                {/* Rule Header */}
                <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="text-4xl md:text-5xl flex-shrink-0">{rule.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <span className="bg-primary text-white text-sm md:text-base font-bold px-3 py-1 rounded-full">
                        {rule.id}
                      </span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                        {rule.title}
                      </h2>
                    </div>
                    <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>

                {/* Example Section */}
                {rule.example.correct && (
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6 border-2 border-green-200">
                    <h3 className="text-base md:text-lg font-bold text-green-800 mb-3 md:mb-4 flex items-center gap-2">
                      <Icons.lightbulb className="w-5 h-5 text-xl md:" />
                      مثال توضيحي:
                    </h3>
                    
                    <div className="space-y-3 md:space-y-4">
                      <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-green-300">
                        <div className="flex items-start gap-2 md:gap-3">
                          <Icons.check className="w-5 h-5 text-xl md: flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-green-800 text-xs md:text-sm mb-1">صحيح:</p>
                            <p className="text-sm md:text-base text-neutral-800 whitespace-pre-line">
                              {rule.example.correct}
                            </p>
                          </div>
                        </div>
                      </div>

                      {rule.example.wrong && (
                        <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-red-300">
                          <div className="flex items-start gap-2 md:gap-3">
                            <Icons.cross className="w-5 h-5 text-xl md: flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold text-red-800 text-xs md:text-sm mb-1">خطأ:</p>
                              <p className="text-sm md:text-base text-neutral-800 whitespace-pre-line">
                                {rule.example.wrong}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Details List */}
                <div className="bg-neutral-50 rounded-xl p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-neutral-800 mb-3 md:mb-4 flex items-center gap-2">
                    <Icons.pin className="w-5 h-5 text-xl md:" />
                    تفاصيل مهمة:
                  </h3>
                  <ul className="space-y-2 md:space-y-3">
                    {rule.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 md:gap-3">
                        <span className="text-secondary text-lg md:text-xl flex-shrink-0 mt-0.5">●</span>
                        <span className="text-sm md:text-base text-neutral-700 leading-relaxed flex-1">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
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
                هل أنت مستعد؟
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-6 md:mb-8 max-w-2xl mx-auto">
                الآن بعد أن فهمت القواعد، حان وقت البدء! ابحث، وثّق، واجمع أكبر عدد من التذاكر.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <StartCompetitionButton className="btn-primary" />
                <Link href="/participate" className="btn-ghost">
                  سجل مشاركتك
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 md:mt-8 text-center"
          >
            <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-center gap-2 md:gap-3 text-blue-800">
                <Icons.message className="w-6 h-6 md:text-3xl" />
                <p className="text-sm md:text-base font-medium">
                  هل لديك سؤال؟ تواصل مع معلمك في مركز مصادر التعلم
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
