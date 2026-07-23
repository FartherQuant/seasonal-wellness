import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, HerbalTea, SolarTerm } from '@/api/client'
import { getConstitutionResult } from '@/lib/storage'

function mapTeaData(data: any): HerbalTea {
  return {
    solar_term: data.meta?.solar_term || '',
    term: data.meta?.solar_term || '',
    constitution: data.meta?.constitution_type || '',
    tea_direction: data.direction || '',
    primary_tea: data.primary || { name: '根据节气推荐花草茶', ingredients: ['根据节气和体质推荐'], preparation: '沸水冲泡10-15分钟', note: '未找到对应的花草茶池数据' },
    backup_tea: data.alternative || null,
    weather_note: data.weather_note || '',
  }
}

function getConstitution(): string {
  const result = getConstitutionResult()
  return result?.constitution || '平和质'
}

export default function TeaPage() {
  const [constitution, setConstitution] = useState<string>('平和质')
  const [hasResult, setHasResult] = useState<boolean>(false)
  const [tea, setTea] = useState<HerbalTea | null>(null)
  const [solarTerm, setSolarTerm] = useState<SolarTerm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async (refresh: boolean = false) => {
    const c = getConstitution()
    setConstitution(c)
    setHasResult(!!getConstitutionResult())
    try {
      if (!refresh) setLoading(true)
      setError(null)
      const [term, rawTea] = await Promise.all([api.getCurrentSolarTerm(), api.getDailyTea(c, undefined, undefined, refresh)])
      setSolarTerm(term)
      setTea(mapTeaData(rawTea))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      if (!refresh) setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadData(true)
  }

  useEffect(() => {
    loadData()
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>花草茶</h2>
          <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>HERBAL TEA · 体质茶饮，每日一杯</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="eyebrow px-3 py-2 rounded-lg border border-bone-soft/20 transition hover:border-gold/40 hover:bg-bone-soft/3 disabled:opacity-50"
            style={{ color: '#C8C0B0' }}
            title="刷新花草茶"
          >
            ↻
          </button>
          {!hasResult && (
            <Link to="/assess" className="eyebrow px-3 py-2 rounded-lg border border-gold/40" style={{ color: '#D4A843' }}>
              → 建议先评测
            </Link>
          )}
          <span className="eyebrow" style={{ color: '#D8A62B' }}>
            {constitution}
          </span>
        </div>
      </div>

      {/* Solar term bar */}
      {solarTerm && (
        <div className="flex items-center gap-3 mb-5">
          <span className="eyebrow" style={{ color: '#C8C0B0' }}>当前节气</span>
          <span className="solar-name" style={{ color: '#4A7C59', fontSize: '1.3rem' }}>{solarTerm.name}</span>
          <span className="ml-3" style={{ color: '#E4755E', fontSize: '1rem' }}>{tea?.tea_direction || solarTerm.wellness_direction}</span>
        </div>
      )}

      {/* Tea cards */}
      {tea && (
        <div className="grid md:grid-cols-2 gap-3 lg:h-[calc(100vh-260px)]">
          {/* Primary tea */}
          <div className="flex flex-col p-5 rounded-lg border border-gold/30" style={{ backgroundColor: 'rgba(212,168,67,0.04)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ background: '#C4553E' }} />
              <h3 className="solar-name" style={{ color: '#E4755E', fontSize: '1.3rem' }}>
                {tea.primary_tea?.name || '暂无配方'}
              </h3>
              <span className="eyebrow" style={{ color: '#C8C0B0' }}>主配方</span>
            </div>
            <div>
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.4rem' }}>食材</span>
              <ul className="space-y-1.5">
                {(tea.primary_tea?.ingredients || []).map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ color: '#F5F0E6', fontSize: '0.8rem' }}>
                    <span className="eyebrow" style={{ color: 'rgba(200,192,176,0.4)', fontSize: '9px' }}>{String(i + 1)}</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.4rem' }}>冲泡方法</span>
              <p style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.5 }}>
                {tea.primary_tea?.preparation || '沸水冲泡10-15分钟'}
              </p>
            </div>
            <div className="mt-auto pt-3 border-t border-bone-soft/8">
              <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.2rem' }}>注意事项</span>
              <p style={{ color: '#C8C0B0', fontSize: '0.75rem' }}>{tea.primary_tea?.note || '请根据个人体质适量饮用'}</p>
            </div>
          </div>

          {/* Backup tea */}
          {tea.backup_tea ? (
            <div className="flex flex-col p-5 rounded-lg border border-bone-soft/8" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ background: '#4A6FA5' }} />
                <h3 className="solar-name" style={{ color: '#F5F0E6', fontSize: '1.1rem' }}>
                  {tea.backup_tea.name}
                </h3>
                <span className="eyebrow" style={{ color: '#C8C0B0' }}>备选配方</span>
              </div>
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.4rem' }}>食材</span>
                <ul className="space-y-1.5">
                  {tea.backup_tea.ingredients.map((ingredient, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ color: '#F5F0E6', fontSize: '0.8rem' }}>
                      <span className="eyebrow" style={{ color: 'rgba(200,192,176,0.4)', fontSize: '9px' }}>{String(i + 1)}</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.4rem' }}>冲泡方法</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.8rem', lineHeight: 1.5 }}>{tea.backup_tea.preparation}</p>
              </div>
              <div className="mt-auto pt-3 border-t border-bone-soft/8">
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.2rem' }}>注意事项</span>
                <p style={{ color: '#C8C0B0', fontSize: '0.75rem' }}>{tea.backup_tea.note}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col p-5 rounded-lg border border-bone-soft/8" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ background: '#4A6FA5' }} />
                <h3 className="solar-name" style={{ color: '#F5F0E6', fontSize: '1.1rem' }}>暂无备选</h3>
                <span className="eyebrow" style={{ color: '#C8C0B0' }}>备选配方</span>
              </div>
              <p style={{ color: '#C8C0B0', fontSize: '0.8rem', lineHeight: 1.5 }}>
                点击刷新按钮，可能获得不同搭配
              </p>
            </div>
          )}

          {/* Weather note */}
          {tea.weather_note && (
            <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-lg border border-bone-soft/8" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#4A6FA5' }} />
              <span className="eyebrow" style={{ color: '#C8C0B0' }}>天气提示：{tea.weather_note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
