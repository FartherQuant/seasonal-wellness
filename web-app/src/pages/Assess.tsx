import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Questionnaire } from '@/api/client'
import { saveConstitutionResult, ConstitutionResult } from '@/lib/storage'

const constitutionDescriptions: Record<string, string> = {
  '平和质': '阴阳气血调和，体态适中，面色红润，精力充沛。',
  '气虚质': '元气不足，易疲乏，气短懒言，易出汗，肢体倦怠。',
  '阳虚质': '阳气不足，怕冷，手足不温，喜热饮食，精神不振。',
  '阴虚质': '阴液亏少，口燥咽干，五心烦热，小便短赤，大便偏干。',
  '痰湿质': '痰湿凝聚，形体肥胖，腹部肥满，胸闷，痰多，面垢油光。',
  '湿热质': '湿热内蕴，面垢油光，易生痤疮，口苦口干，身重困倦。',
  '血瘀质': '血行不畅，肤色晦暗，色素沉着，容易出现瘀斑，口唇黯淡。',
  '气郁质': '气机郁滞，精神不爽，胸胁胀满，善太息，易烦闷不乐。',
  '特禀质': '先天失常，生理功能薄弱或亢进，易过敏，易遗传。',
}

export default function Assess() {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ConstitutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    api.getQuestionnaire()
      .then(data => setQuestionnaire(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [Number(questionId)]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Backend expects answers as an array of 8 elements
      const numericAnswers: Record<string, number> = {}
      Object.keys(answers).forEach(k => {
        numericAnswers[String(Number(k))] = answers[k]
      })
      const res: any = await api.submitAssessment(numericAnswers)
      const result: ConstitutionResult = {
        constitution: res.constitution,
        description: res.description || '',
        confidence: res.confidence || 'medium',
        scores: res.scores || {},
      }
      setResult(result)
      // Persist to sessionStorage
      saveConstitutionResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const isAllAnswered = () => {
    return questionnaire?.questions.every(q => answers[q.id] !== undefined)
  }

  if (loading) {
    return (
      <div className="state-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="eyebrow" style={{ color: '#C8C0B0' }}>LOADING</p>
        </div>
      </div>
    )
  }

  if (error && !result) {
    return (
      <div className="state-center">
        <div className="text-center p-6">
          <p className="text-red-400 text-lg mb-2">加载失败</p>
          <p style={{ color: '#C8C0B0' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md p-8">
          <span className="eyebrow" style={{ color: '#D4A843', marginBottom: '1rem' }}>YOUR CONSTITUTION</span>
          <h2 className="solar-name" style={{ fontSize: '3rem', color: '#D4A843', marginBottom: '1rem' }}>
            {result.constitution}
          </h2>
          <p style={{ color: '#F5F0E6', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
            {constitutionDescriptions[result.constitution] || result.description}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/constitution" className="px-5 py-2.5 rounded-lg border border-gold/40" style={{ color: '#D4A843' }}>
              查看体质详情
            </Link>
            <Link to="/wellness" className="px-5 py-2.5 rounded-lg border border-bone-soft/20" style={{ color: '#F5F0E6' }}>
              查看养生方案
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questionnaire?.questions[currentStep]
  const getOptionsArray = (options: any) => {
    if (Array.isArray(options)) return options
    if (options && typeof options === 'object') {
      return Object.entries(options).map(([key, value]) => ({
        text: key === 'yes' ? '是' : key === 'no' ? '否' : key,
        value: Number(value),
      }))
    }
    return []
  }
  const currentOptions = currentQuestion ? getOptionsArray(currentQuestion.options) : []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>体质测评</h2>
        <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>ASSESSMENT · 8题快速测评</p>
      </div>

      {/* Progress bar */}
      {questionnaire && (
        <div className="mb-5">
          <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(200,192,176,0.1)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questionnaire.questions.length) * 100}%`, backgroundColor: '#D4A843' }}
           ></div>
          </div>
          <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.35rem', fontSize: '10px' }}>
            第 {currentStep + 1} 题 / 共 {questionnaire.questions.length} 题
          </p>
        </div>
      )}

      {/* Question */}
      {currentQuestion && (
        <div className="flex-1 flex flex-col">
          <h3 style={{ color: '#F5F0E6', fontSize: '1.15rem', fontWeight: 500, marginBottom: '1.5rem' }}>
            {currentQuestion.question}
          </h3>

          <div className="space-y-2.5">
            {currentOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className="w-full text-left px-4 py-3 rounded-lg border transition"
                style={{
                  backgroundColor: answers[currentQuestion.id] === option.value ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.02)',
                  borderColor: answers[currentQuestion.id] === option.value ? '#D4A843' : 'rgba(245,240,230,0.08)',
                  color: answers[currentQuestion.id] === option.value ? '#F5F0E6' : '#C8C0B0',
                  fontWeight: answers[currentQuestion.id] === option.value ? 600 : 400,
                }}
              >
                <span className="eyebrow mr-3" style={{ color: 'rgba(200,192,176,0.4)' }}>{String.fromCharCode(65 + i)}</span>
                <span style={{ fontSize: '0.9rem' }}>{option.text}</span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-5">
            <button
              onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="px-5 py-2.5 rounded-lg transition"
              style={{
                backgroundColor: currentStep === 0 ? 'rgba(200,192,176,0.05)' : 'rgba(200,192,176,0.1)',
                color: currentStep === 0 ? 'rgba(200,192,176,0.3)' : '#C8C0B0',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              上一题
            </button>

            {currentStep === (questionnaire?.questions.length || 0) - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isAllAnswered() || submitting}
                className="px-5 py-2.5 rounded-lg transition"
                style={{
                  backgroundColor: !isAllAnswered() || submitting ? 'rgba(200,192,176,0.05)' : '#D4A843',
                  color: !isAllAnswered() || submitting ? 'rgba(200,192,176,0.3)' : '#0E1318',
                  fontWeight: 600,
                  cursor: !isAllAnswered() || submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? '提交中...' : '提交结果'}
              </button>
            ) : (
              <button
                onClick={() => answers[currentQuestion?.id || ''] !== undefined && setCurrentStep(currentStep + 1)}
                disabled={answers[currentQuestion?.id || ''] === undefined}
                className="px-5 py-2.5 rounded-lg transition"
                style={{
                  backgroundColor: answers[currentQuestion?.id || ''] === undefined ? 'rgba(200,192,176,0.05)' : '#D4A843',
                  color: answers[currentQuestion?.id || ''] === undefined ? 'rgba(200,192,176,0.3)' : '#0E1318',
                  fontWeight: 600,
                  cursor: answers[currentQuestion?.id || ''] === undefined ? 'not-allowed' : 'pointer',
                }}
              >
                下一题
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
