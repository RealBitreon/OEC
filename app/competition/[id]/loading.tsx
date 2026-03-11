import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CompetitionLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Back button skeleton */}
            <div className="mb-6">
              <div className="h-10 w-32 bg-neutral-200 rounded-lg animate-pulse" />
            </div>

            {/* Header skeleton */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
                    <div className="h-10 w-64 bg-white/20 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-6 w-full bg-white/20 rounded-lg animate-pulse mb-2" />
                  <div className="h-6 w-3/4 bg-white/20 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Stats skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="w-6 h-6 bg-white/20 rounded mb-2 animate-pulse" />
                    <div className="h-8 w-16 bg-white/20 rounded mb-1 animate-pulse" />
                    <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Main content skeleton */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="h-8 w-48 bg-neutral-200 rounded-lg mb-6 animate-pulse" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-neutral-200 rounded-full animate-pulse" />
                        <div className="flex-1">
                          <div className="h-5 w-32 bg-neutral-200 rounded mb-2 animate-pulse" />
                          <div className="h-4 w-48 bg-neutral-200 rounded mb-1 animate-pulse" />
                          <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar skeleton */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="h-7 w-24 bg-neutral-200 rounded-lg mb-4 animate-pulse" />
                  <div className="space-y-4">
                    <div className="h-32 bg-neutral-200 rounded-xl animate-pulse" />
                    <div className="h-14 bg-neutral-200 rounded-xl animate-pulse" />
                    <div className="h-12 bg-neutral-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
