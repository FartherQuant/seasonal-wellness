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

export default function SolarTermsPage() {
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
  const health = plan.health || {}
  const routine = plan.daily_routine || {}
  const isDefaultConst = isDefault

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>节气养生</h2>
          <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>SOLAR TERM WELLNESS · 因时制宜</p>
        </div>
        <div className="flex items-center gap-3">
          {isDefaultConst && (
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
          <span className="ml-3" style={{ color: '#6A9C79', fontSize: '1rem' }}>{solarTerm.wellness_direction || health.direction || ''}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 lg:h-[calc(100vh-260px)]">
        {/* Health */}
        <div className="flex flex-col p-4 rounded-lg border border-bone-soft/8" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: '#4A7C59' }} />
            <span style={{ color: '#F5F0E6', fontWeight: 600 }}>健康建议</span>
          </div>
          {health.high_risk && health.high_risk.length > 0 && (
            <div className="mb-3">
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>高风险</span>
              <ul className="space-y-1.5">
                {health.high_risk.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2" style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: '#4A7C59' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {health.prevention && health.prevention.length > 0 && (
            <div>
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>预防要点</span>
              <ul className="space-y-1.5">
                {health.prevention.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2" style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: '#6A9C79' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Routine */}
        <div className="flex flex-col p-4 rounded-lg border border-bone-soft/8" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: '#4A6FA5' }} />
            <span style={{ color: '#F5F0E6', fontWeight: 600 }}>起居建议</span>
          </div>
          <div className="space-y-3">
            {routine.sleep && (
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>睡眠</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.5 }}>{routine.sleep}</p>
              </div>
            )}
            {routine.exercise && (
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>运动</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.5 }}>{routine.exercise}</p>
              </div>
            )}
            {routine.emotion && (
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>情志</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.5 }}>{routine.emotion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="flex flex-col p-4 rounded-lg border border-bone-soft/8" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: '#C4553E' }} />
            <span style={{ color: '#F5F0E6', fontWeight: 600 }}>注意事项</span>
          </div>
          {health.vulnerability && (
            <div>
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>体质脆弱点</span>
              <p style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.6 }}>{health.vulnerability}</p>
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-bone-soft/8">
            <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem', fontSize: '9px' }}>养生方向</span>
            <p style={{ color: '#E4755E', fontSize: '0.85rem', lineHeight: 1.5 }}>{health.direction || ''}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
