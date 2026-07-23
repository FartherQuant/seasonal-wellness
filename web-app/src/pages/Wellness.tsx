import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, SolarTerm } from '@/api/client'
import { getConstitutionResult } from '@/lib/storage'

function getConstitution(): string {
  const result = getConstitutionResult()
  return result?.constitution || '平和质'
}

function isDefaultConstitution(): boolean {
  return !getConstitutionResult()
}

export default function WellnessPage() {
  const [constitution, setConstitution] = useState<string>('平和质')
  const [isDefault, setIsDefault] = useState<boolean>(true)
  const [solarTerm, setSolarTerm] = useState<SolarTerm | null>(null)
  const [wellness, setWellness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const c = getConstitution()
    setConstitution(c)
    setIsDefault(isDefaultConstitution())

    Promise.all([
      api.getCurrentSolarTerm(),
      api.getWellnessPlan(c),
    ])
      .then(([term, raw]) => {
        setSolarTerm(term)
        setWellness(raw)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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

  if (error) {
    return (
      <div className="state-center">
        <div className="text-center p-6">
          <p className="text-red-400 text-lg mb-2">加载失败</p>
          <p style={{ color: '#C8C0B0' }}>{error}</p>
        </div>
      </div>
    )
  }

  const plan = wellness?.plan || {}
  const routine = plan.daily_routine || {}
  const diet = plan.diet || {}

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>养生方案</h2>
          <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>WELLNESS PLAN · 起居与饮食</p>
        </div>
        <div className="flex items-center gap-3">
          {isDefault && (
            <Link to="/assess" className="eyebrow px-3 py-2 rounded-lg border border-gold/40" style={{ color: '#D4A843' }}>
              → 建议先评测
            </Link>
          )}
          <span className="eyebrow" style={{ color: '#D8A62B' }}>{constitution}</span>
        </div>
      </div>

      {/* Solar term bar */}
      {solarTerm && (
        <div className="flex items-center gap-3 mb-5">
          <span className="eyebrow" style={{ color: '#C8C0B0' }}>当前节气</span>
          <span className="solar-name" style={{ color: '#4A7C59', fontSize: '1.3rem' }}>{solarTerm.name}</span>
          <span className="ml-3" style={{ color: '#6A9C79', fontSize: '1rem' }}>{diet.direction || ''}</span>
        </div>
      )}

      {/* 起居建议 */}
      <div className="flex flex-col p-5 rounded-lg border border-bone-soft/8 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full" style={{ background: '#4A6FA5' }} />
          <span style={{ color: '#F5F0E6', fontWeight: 600 }}>起居建议</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {routine.sleep && (
            <div>
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>睡眠</span>
              <p style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.6 }}>{routine.sleep}</p>
            </div>
          )}
          {routine.exercise && (
            <div>
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>运动</span>
              <p style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.6 }}>{routine.exercise}</p>
            </div>
          )}
          {routine.emotion && (
            <div>
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>情志</span>
              <p style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.6 }}>{routine.emotion}</p>
            </div>
          )}
        </div>
      </div>

      {/* 饮食建议 */}
      <div className="flex flex-col p-5 rounded-lg border border-bone-soft/8" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full" style={{ background: '#B8860B' }} />
          <span style={{ color: '#F5F0E6', fontWeight: 600 }}>饮食建议</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 宜食 */}
          <div>
            <span className="eyebrow" style={{ color: '#4A7C59', display: 'block', marginBottom: '0.6rem', fontSize: '11px' }}>
              宜食
            </span>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {diet.additions && diet.additions.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2" style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#4A7C59' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* 忌食 */}
          <div>
            <span className="eyebrow" style={{ color: '#E4755E', display: 'block', marginBottom: '0.6rem', fontSize: '11px' }}>
              忌食
            </span>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {diet.restrictions && diet.restrictions.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2" style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#E4755E' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {diet.direction && (
          <div className="mt-4 pt-3 border-t border-bone-soft/8">
            <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>饮食方向</span>
            <p style={{ color: '#B8860B', fontSize: '0.85rem' }}>{diet.direction}</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {wellness?.disclaimer && (
        <div className="mt-3 pt-3 border-t border-bone-soft/8">
          <p className="eyebrow" style={{ color: 'rgba(200,192,176,0.4)' }}>{wellness.disclaimer}</p>
        </div>
      )}
    </div>
  )
}
