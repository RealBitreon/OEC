export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-xl text-gray-700 font-medium">جاري التحميل...</p>
      </div>
    </div>
  )
}
