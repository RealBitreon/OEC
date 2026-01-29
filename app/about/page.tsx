/**
 * About Page for مسابقة الموسوعة العُمانية
 * 
 * Design Match Notes:
 * - Reuses exact design tokens from homepage
 * - Beautiful cards with hover effects
 * - Team members with profile cards
 * - Goals section with icons
 * - School information with pride
 * - Developer credit with special hover effect
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'

export default function AboutPage() {
  const goals = [
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="11" cy="11" r="3" fill="currentColor" opacity="0.3"/>
        </svg>
      ),
      title: 'تطوير مهارات البحث',
      description: 'تعزيز قدرة الطلاب على البحث الفعّال في المصادر المعرفية'
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'التوثيق الدقيق',
      description: 'تعليم الطلاب أهمية التوثيق العلمي الصحيح للمعلومات'
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'التحفيز والمنافسة',
      description: 'خلق بيئة تنافسية إيجابية تشجع على التميز والإبداع'
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
        </svg>
      ),
      title: 'الاعتماد على النفس',
      description: 'تنمية الاستقلالية والثقة بالنفس في البحث والتعلم'
    }
  ]

  const team = [
    {
      name: 'الأستاذ مبارك',
      role: 'مسؤول مصادر التعلم',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: 'مدير المدرسة',
      role: 'الإشراف العام',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'وليد الغافري',
      role: 'مساعد المدير',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    }
  ]

  const supervisors = [
    {
      name: 'الأستاذ محمد السيد',
      role: 'معلم التقنية',
      subject: 'الإشراف التقني'
    },
    {
      name: 'الأستاذ أيوب البريكي',
      role: 'معلم التقنية',
      subject: 'الإشراف التقني'
    }
  ]

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      {/* Page Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light pt-32 pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-secondary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <div className="section-container relative z-10">
          <div className="mb-6">
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
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              عن المسابقة
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
              مبادرة تعليمية لتطوير مهارات البحث والتوثيق لدى طلاب مدرسة الإمام المهنا
            </p>
          </motion.div>
        </div>
      </section>

      {/* School Info */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full mb-8">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-primary text-lg">مدرسة الإمام المهنا</span>
            </div>

            <h2 className="text-4xl font-bold text-primary mb-6">
              مسابقة داخلية للتميز والإبداع
            </h2>
            
            <p className="text-xl text-neutral-700 leading-relaxed mb-4">
              مسابقة الموسوعة العُمانية هي مبادرة تعليمية داخل <span className="font-bold text-primary">مدرسة الإمام المهنا</span> في <span className="font-bold">مسقط، سلطنة عُمان</span>، تهدف إلى تطوير مهارات البحث العلمي والتوثيق الدقيق لدى الطلاب.
            </p>

            <div className="inline-flex items-center gap-2 text-neutral-600 mt-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="font-semibold">مسقط، سلطنة عُمان</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-16 bg-neutral-50">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">أهداف المسابقة</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              نسعى لتحقيق مجموعة من الأهداف التعليمية والتربوية
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {goals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card text-center group hover:border-2 hover:border-primary/20"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  {goal.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-3">
                  {goal.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {goal.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">المسؤولون عن المسابقة</h2>
            <p className="text-xl text-neutral-600">
              فريق متميز من الإدارة والمعلمين
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card text-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20"
              >
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {member.name}
                </h3>
                <p className="text-neutral-600 font-medium">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Supervision Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">الإشراف التقني</h2>
            <p className="text-xl text-neutral-600">
              معلمو التقنية المشرفون على المسابقة
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {supervisors.map((supervisor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card relative overflow-hidden group cursor-pointer bg-gradient-to-br from-white to-secondary/10 border-2 border-secondary/30"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Sparkles Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-primary rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center mx-auto mb-4 text-primary-dark group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 10H16M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  {/* Name */}
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {supervisor.name}
                  </h3>
                  
                  {/* Role */}
                  <p className="text-neutral-600 font-medium mb-1">
                    {supervisor.role}
                  </p>
                  
                  <p className="text-neutral-500 text-sm mb-4">
                    {supervisor.subject}
                  </p>

                  {/* Hover Info */}
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-all duration-500 mt-4 pt-4 border-t-2 border-secondary/20"
                  >
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="text-neutral-700">مدرسة الإمام المهنا</span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className="text-neutral-700">الإشراف على المسابقة والموقع</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-primary-dark via-primary to-primary-light">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-6">
              هل أنت مستعد للمشاركة؟
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              انضم إلى المسابقة الآن وطوّر مهاراتك في البحث والتوثيق
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/participate"
                className="btn-secondary text-lg px-10 py-5"
              >
                ابدأ المشاركة
              </Link>
              <Link
                href="/"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-bold px-10 py-5 rounded-button text-lg transition-all duration-300 hover:scale-105 inline-block"
              >
                العودة للرئيسية
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
