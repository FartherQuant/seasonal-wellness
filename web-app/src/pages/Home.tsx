import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, SolarTerm } from '@/api/client'
import { getSelectedCity } from '@/lib/city'
import {
  SEASON_CONFIG,
  getSeason,
} from '@/lib/term'

const QUICK_LINKS = [
  { to: '/solar-term', label: '节气详情', desc: '健康+起居+注意事项', accent: '#4A7C59' },
  { to: '/constitution', label: '体质科普', desc: '九种体质', accent: '#4A6FA5' },
  { to: '/wellness', label: '养生方案', desc: '起居与饮食', accent: '#4A7C59' },
  { to: '/recipe', label: '每日食谱', desc: '节气食疗', accent: '#B8860B' },
  { to: '/tea', label: '花草茶', desc: '体质茶饮', accent: '#C4553E' },
  { to: '/assess', label: '体质测评', desc: '8题快速测评', accent: '#8B6BA8' },
]

export default function Home() {
  const navigate = useNavigate()
  const [solarTerm, setSolarTerm] = useState<SolarTerm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [seasonConfig, setSeasonConfig] = useState(SEASON_CONFIG.summer)
  const [currentTerm, setCurrentTerm] = useState('大暑')
  const [cityName, setCityName] = useState<string | null>(null)
  const [weather, setWeather] = useState<any>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    api.getCurrentSolarTerm()
      .then(rawData => {
        const raw: any = rawData
        const mapped: SolarTerm = {
          name: raw.term || raw.name || '',
          term: raw.term || raw.name || '',
          solar_longitude: raw.solar_longitude || '',
          date_range: raw.date || raw.date_range || '',
          climate_pattern: raw.climate_pattern || '',
          climate: raw.climate_pattern || '',
          yinyang: raw.yinyang || '',
          yin_yang: raw.yinyang || '',
          tcm_organ: raw.tcm_organ || '',
          tcm_organ_command: raw.tcm_organ || '',
          wellness_direction: raw.wellness_direction || '',
          vulnerability_points: raw.vulnerability_points || [],
          three_pentads: raw.three_pentads || [],
          description: raw.description || '',
          season: raw.season || '',
        }
        setSolarTerm(mapped)
        setCurrentTerm(mapped.name)

        const termSeason = getSeason(mapped.name)
        if (SEASON_CONFIG[termSeason]) {
          setSeasonConfig(SEASON_CONFIG[termSeason])
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const selected = getSelectedCity()
    const city = selected || '北京'
    setCityName(city)
    loadWeather(city)
  }, [])

  const loadWeather = async (city: string) => {
    setWeatherLoading(true)
    try {
      const w = await api.getWeather(city)
      setWeather(w)
    } catch (err) {
      console.warn('天气加载失败', err)
    } finally {
      setWeatherLoading(false)
    }
  }

  const handleCityClick = () => {
    if (cityName) {
      setCityName(null)
      setWeather(null)
    } else {
      navigate('/city-picker')
    }
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

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

  if (!solarTerm) {
    return (
      <div className="state-center">
        <p style={{ color: '#C8C0B0' }}>暂无数据</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center h-full">
      <p className="eyebrow" style={{ color: '#C8C0B0', marginBottom: '1.5rem' }}>
        SOLAR TERM · {formatDate(currentDate)} · {formatTime(currentDate)}
      </p>

      {/* City + Weather */}
      <div className="mb-6">
        {cityName ? (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCityClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bone-soft/20 text-bone transition hover:border-gold/40"
              style={{ fontSize: '0.85rem' }}
            >
              <span style={{ color: '#D4A843' }}>●</span>
              {cityName}
            </button>
            {weatherLoading ? (
              <span className="eyebrow" style={{ color: '#C8C0B0' }}>天气加载中...</span>
            ) : weather ? (
              <div className="flex items-center gap-4">
                <span style={{ color: '#F5F0E6', fontSize: '1.1rem', fontWeight: 600 }}>
                  {weather.temperature}
                </span>
                <span style={{ color: '#C8C0B0', fontSize: '0.85rem' }}>
                  {weather.weather}
                </span>
                <span style={{ color: '#C8C0B0', fontSize: '0.85rem' }}>
                  体感 {weather.feelsLike}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            onClick={handleCityClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/30 transition hover:border-gold/60 hover:bg-bone-soft/3"
            style={{ color: '#D4A843', fontSize: '0.85rem' }}
          >
            + 选择城市
          </button>
        )}
      </div>

      <h2
        className="solar-name"
        style={{
          fontSize: 'clamp(56px, 10vw, 120px)',
          color: '#F5F0E6',
          marginBottom: '1.5rem',
        }}
      >
        {currentTerm}
      </h2>

      <p
        style={{
          color: seasonConfig.accentLight,
          fontSize: '1.25rem',
          marginBottom: '0.5rem',
        }}
      >
        {solarTerm.wellness_direction}
      </p>
      <p className="eyebrow" style={{ color: '#C8C0B0', marginBottom: '2rem' }}>
        因时制宜 · 因地制宜 · 因人制宜
      </p>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-8">
        {QUICK_LINKS.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex flex-col gap-1 px-4 py-3 rounded-lg border border-bone-soft/8 hover:bg-bone-soft/3 transition"
            style={{ borderColor: 'rgba(245,240,230,0.08)' }}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: item.accent }} />
              <span style={{ color: '#F5F0E6', fontSize: '0.85rem' }}>{item.label}</span>
            </span>
            <span className="eyebrow" style={{ color: '#C8C0B0', fontSize: '12px', paddingLeft: '1.25rem' }}>
              {item.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
