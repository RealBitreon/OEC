export default function Loading() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-bl from-emerald-50 via-green-50 to-teal-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Loading Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 overflow-hidden">
          <div className="bg-gradient-to-l from-emerald-500 via-green-500 to-teal-500 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">جاري التحميل...</h1>
          </div>
          <div className="p-8 space-y-4">
            <div className="h-12 bg-emerald-100 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-emerald-100 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-emerald-100 rounded-xl animate-pulse"></div>
            <div className="h-14 bg-emerald-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
