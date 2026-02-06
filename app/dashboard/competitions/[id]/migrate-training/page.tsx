'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  getCompetitionQuestionsForMigration,
  setQuestionCorrectAnswer,
  chooseWinnerAnswer,
  migrateCompetitionToTraining,
  autoMigrateWithWinnerAnswers,
  type QuestionMigrationData,
  type WinnerAnswer
} from '@/app/dashboard/actions/training-migration'

export default function MigrateToTrainingPage() {
  const params = useParams()
  const router = useRouter()
  const competitionId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [migrationData, setMigrationData] = useState<any>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [migrating, setMigrating] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    loadMigrationData()
  }, [competitionId])
  
  async function loadMigrationData() {
    try {
      setLoading(true)
      setError(null)
      const data = await getCompetitionQuestionsForMigration(competitionId)
      setMigrationData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  function toggleQuestion(questionId: string) {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }
  
  async function handleChooseWinnerAnswer(questionId: string, submissionId: string) {
    try {
      await chooseWinnerAnswer(questionId, submissionId)
      setSelectedAnswers({ ...selectedAnswers, [questionId]: submissionId })
      await loadMigrationData()
    } catch (err: any) {
      alert(`خطأ: ${err.message}`)
    }
  }
  
  async function handleAutoMigrate() {
    if (!confirm('هل تريد استخدام إجابات الفائزين تلقائياً لجميع الأسئلة؟')) {
      return
    }
    
    try {
      setMigrating(true)
      const result = await autoMigrateWithWinnerAnswers(competitionId)
      alert(
        `تم النقل بنجاح!\n` +
        `تم نقل: ${result.migrated} سؤال\n` +
        `تم تخطي: ${result.skipped} سؤال\n` +
        `أخطاء: ${result.errors.length}`
      )
      router.push('/dashboard/training-questions')
    } catch (err: any) {
      alert(`خطأ: ${err.message}`)
    } finally {
      setMigrating(false)
    }
  }
  
  async function handleManualMigrate() {
    if (!confirm('هل تريد نقل الأسئلة إلى التدريب؟')) {
      return
    }
    
    try {
      setMigrating(true)
      const result = await migrateCompetitionToTraining(competitionId, {
        skipQuestionsWithoutAnswers: true
      })
      alert(
        `تم النقل بنجاح!\n` +
        `تم نقل: ${result.migrated} سؤال\n` +
        `تم تخطي: ${result.skipped} سؤال\n` +
        `أخطاء: ${result.errors.length}`
      )
      router.push('/dashboard/training-questions')
    } catch (err: any) {
      alert(`خطأ: ${err.message}`)
    } finally {
      setMigrating(false)
    }
  }
  
  if (loading) return <LoadingState message="جاري تحميل بيانات النقل..." />
  if (error) return <ErrorState message={error} />
  if (!migrationData) return <ErrorState message="لا توجد بيانات" />
  
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">نقل الأسئلة إلى التدريب</h1>
        <p className="text-gray-600">
          المسابقة: {migrationData.competition.title}
        </p>
      </div>
      
      {/* Summary Card */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-bold mb-4">ملخص</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {migrationData.totalQuestions}
            </div>
            <div className="text-sm text-gray-600">إجمالي الأسئلة</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {migrationData.questionsWithOfficialAnswers}
            </div>
            <div className="text-sm text-gray-600">أسئلة بإجابات رسمية</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {migrationData.questionsNeedingReview}
            </div>
            <div className="text-sm text-gray-600">تحتاج مراجعة</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {migrationData.questions.filter((q: QuestionMigrationData) => 
                q.winnerAnswers.length > 0
              ).length}
            </div>
            <div className="text-sm text-gray-600">لديها إجابات فائزين</div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleAutoMigrate}
            disabled={migrating}
            className="flex-1"
          >
            {migrating ? 'جاري النقل...' : 'نقل تلقائي (استخدام إجابات الفائزين)'}
          </Button>
          <Button
            onClick={handleManualMigrate}
            disabled={migrating}
            variant="secondary"
            className="flex-1"
          >
            {migrating ? 'جاري النقل...' : 'نقل يدوي (تخطي الأسئلة بدون إجابات)'}
          </Button>
        </div>
      </Card>
      
      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">الأسئلة</h2>
        
        {migrationData.questions.map((question: QuestionMigrationData) => {
          const isExpanded = expandedQuestions.has(question.questionId)
          const statusColor = question.hasOfficialAnswer 
            ? 'bg-green-100 text-green-800'
            : question.winnerAnswers.length > 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
          
          return (
            <Card key={question.questionId} className="p-4">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleQuestion(question.questionId)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                      {question.hasOfficialAnswer 
                        ? '✓ إجابة رسمية'
                        : question.winnerAnswers.length > 0
                        ? `${question.winnerAnswers.length} إجابة فائز`
                        : '✗ لا توجد إجابة'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100">
                      {question.type}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100">
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="font-medium">{question.questionText}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  {isExpanded ? '▼' : '◀'}
                </button>
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Official Answer */}
                  {question.hasOfficialAnswer && (
                    <div className="bg-green-50 p-3 rounded">
                      <div className="font-medium text-green-800 mb-1">
                        الإجابة الرسمية:
                      </div>
                      <div className="text-green-900">{question.correctAnswer}</div>
                      {question.sourceRef.volume && (
                        <div className="text-sm text-green-700 mt-2">
                          المرجع: المجلد {question.sourceRef.volume}، 
                          صفحة {question.sourceRef.page}، 
                          سطر {question.sourceRef.lineFrom}-{question.sourceRef.lineTo}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Winner Answers */}
                  {question.winnerAnswers.length > 0 && (
                    <div>
                      <div className="font-medium mb-2">
                        إجابات الفائزين ({question.winnerAnswers.length}):
                      </div>
                      <div className="space-y-2">
                        {question.winnerAnswers.map((winner: WinnerAnswer) => (
                          <div 
                            key={winner.submissionId}
                            className="bg-yellow-50 p-3 rounded flex items-start justify-between"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-yellow-900">
                                {winner.participantName}
                              </div>
                              <div className="text-yellow-800 mt-1">
                                {winner.answer}
                              </div>
                              <div className="text-xs text-yellow-600 mt-1">
                                {new Date(winner.submittedAt).toLocaleString('ar-EG')}
                              </div>
                            </div>
                            {!question.hasOfficialAnswer && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleChooseWinnerAnswer(
                                    question.questionId,
                                    winner.submissionId
                                  )
                                }}
                              >
                                اختيار
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* No Answer Warning */}
                  {!question.hasOfficialAnswer && question.winnerAnswers.length === 0 && (
                    <div className="bg-red-50 p-3 rounded text-red-800">
                      ⚠️ لا توجد إجابة رسمية ولا إجابات فائزين. سيتم تخطي هذا السؤال.
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
