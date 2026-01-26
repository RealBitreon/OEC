'use client'

import { useState } from 'react'
import type { AuditLog } from '@/lib/store/types'

interface AuditTabProps {
  auditLogs: AuditLog[]
  isCEO: boolean
}

export default function AuditTab({ auditLogs, isCEO }: AuditTabProps) {
  const [repairing, setRepairing] = useState(false)
  const [repairResult, setRepairResult] = useState<any>(null)

  const handleRepairData = async () => {
    if (!confirm('هل أنت متأكد من إصلاح البيانات تلقائياً؟ سيتم إصلاح التناقضات والأخطاء الشائعة.')) {
      return
    }

    setRepairing(true)
    setRepairResult(null)

    try {
      const response = await fetch('/api/admin/repair-data', {
        method: 'POST'
      })

      const result = await response.json()
      
      if (response.ok) {
        setRepairResult(result)
        if (result.repaired) {
          alert('تم إصلاح البيانات بنجاح! سيتم تحديث الصفحة.')
          window.location.reload()
        } else {
          alert('لا توجد مشاكل تحتاج إلى إصلاح.')
        }
      } else {
        alert(result.error || 'فشل إصلاح البيانات')
      }
    } catch (error) {
      console.error('Repair error:', error)
      alert('حدث خطأ أثناء إصلاح البيانات')
    } finally {
      setRepairing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">سجل التدقيق</h1>
          <p className="text-neutral-600">سجل جميع الإجراءات في النظام</p>
        </div>
        {isCEO && (
          <button
            onClick={handleRepairData}
            disabled={repairing}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {repairing ? 'جاري الإصلاح...' : 'إصلاح البيانات تلقائياً'}
          </button>
        )}
      </div>

      {repairResult && (
        <div className={`rounded-lg p-4 ${repairResult.validation.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <h3 className="font-bold mb-2">نتيجة الإصلاح:</h3>
          {repairResult.repairs.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold mb-1">الإصلاحات المطبقة:</p>
              <ul className="list-disc list-inside space-y-1">
                {repairResult.repairs.map((repair: string, idx: number) => (
                  <li key={idx} className="text-sm">{repair}</li>
                ))}
              </ul>
            </div>
          )}
          {repairResult.validation.errors.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-red-600 mb-1">أخطاء متبقية:</p>
              <ul className="list-disc list-inside space-y-1">
                {repairResult.validation.errors.map((error: string, idx: number) => (
                  <li key={idx} className="text-sm text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          )}
          {repairResult.validation.warnings.length > 0 && (
            <div>
              <p className="font-semibold text-yellow-600 mb-1">تحذيرات:</p>
              <ul className="list-disc list-inside space-y-1">
                {repairResult.validation.warnings.map((warning: string, idx: number) => (
                  <li key={idx} className="text-sm text-yellow-600">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {auditLogs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد سجلات بعد</h3>
          <p className="text-neutral-600">سيتم تسجيل الإجراءات هنا</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">الإجراء</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">المستخدم</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {[...auditLogs].reverse().map(log => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm text-neutral-900">{log.action}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-700">{log.performedBy}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(log.timestamp).toLocaleString('ar-OM')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
