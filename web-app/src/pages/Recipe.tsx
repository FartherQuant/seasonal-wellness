import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Recipe, SolarTerm } from '@/api/client'
import { getConstitutionResult } from '@/lib/storage'

const mealSections = [
  { key: 'breakfast', label: '早餐', time: '06:00', color: '#B8860B' },
  { key: 'lunch', label: '午餐', time: '12:00', color: '#C4553E' },
  { key: 'dinner', label: '晚餐', time: '18:00', color: '#4A6FA5' },
  { key: 'soup', label: '汤品', time: '全天', color: '#4A7C59' },
]

function getConstitution(): string {
  const result = getConstitutionResult()
  return result?.constitution || '平和质'
}

export default function RecipePage() {
  const [constitution, setConstitution] = useState<string>('平和质')
  const [hasResult, setHasResult] = useState<boolean>(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
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
      const [term, r] = await Promise.all([api.getCurrentSolarTerm(), api.getDailyRecipe(c, undefined, undefined, refresh)])
      setSolarTerm(term)
      setRecipe(r)
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
          <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>每日食谱</h2>
          <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>DAILY RECIPES · 节气食疗，药食同源</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="eyebrow px-3 py-2 rounded-lg border border-bone-soft/20 transition hover:border-gold/40 hover:bg-bone-soft/3 disabled:opacity-50"
            style={{ color: '#C8C0B0' }}
            title="刷新食谱"
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
          <span className="ml-3" style={{ color: '#D8A62B', fontSize: '1rem' }}>{solarTerm.wellness_direction}</span>
        </div>
      )}

      {/* Meals */}
      {recipe && (
        <div className="grid grid-cols-2 gap-3 lg:h-[calc(100vh-260px)]">
          {mealSections.map(section => {
            const item = recipe[section.key as keyof Recipe] as string
            return (
              <div key={section.key} className="flex flex-col p-4 rounded-lg border border-bone-soft/8 justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: section.color }} />
                  <span style={{ color: '#F5F0E6', fontWeight: 600 }}>{section.label}</span>
                  <span className="ml-auto eyebrow" style={{ color: '#C8C0B0' }}>{section.time}</span>
                </div>
                <p style={{ color: '#F5F0E6', fontSize: '1rem', lineHeight: 1.6 }}>
                  {item}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Weather note */}
      {recipe?.meta && (
        <div className="mt-3 pt-3 border-t border-bone-soft/8">
          <p className="eyebrow" style={{ color: 'rgba(200,192,176,0.4)' }}>
            体质：{recipe.meta.constitution_type} · 节气：{recipe.meta.solar_term} · 天气调整：{recipe.meta.weather_adjusted ? '是' : '否'}
          </p>
        </div>
      )}
    </div>
  )
}
