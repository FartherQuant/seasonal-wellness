import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { setSelectedCity } from '@/lib/city'

interface City {
  name: string
  province: string
  region: string
}

export default function CityPicker() {
  const navigate = useNavigate()
  const [cities, setCities] = useState<City[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getCities()
      .then(data => setCities(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = cities.filter(c =>
    c.name.includes(search) || c.province.includes(search) || c.region.includes(search)
  )

  const handleSelect = (city: City) => {
    setSelectedCity(city.name)
    window.dispatchEvent(new CustomEvent('cityChanged'))
    navigate(-1)
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

  if (error) {
    return (
      <div className="state-center">
        <div className="text-center p-6">
          <p className="text-red-400 text-lg mb-2">加载失败</p>
          <p style={{ color: '#C8C0B0' }}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-5 py-2 rounded-lg border border-gold/40"
            style={{ color: '#D4A843' }}
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>选择城市</h2>
          <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>SELECT CITY · {cities.length} 个城市</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索城市..."
          className="w-full px-4 py-3 rounded-lg border border-bone-soft/20 bg-transparent text-bone placeholder-bone-soft/40"
          style={{ fontSize: '0.9rem', outline: 'none' }}
        />
      </div>

      {/* City list */}
      <div className="flex-1 overflow-y-auto scrollable">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filtered.map(city => (
            <button
              key={city.name}
              onClick={() => handleSelect(city)}
              className="px-4 py-3 rounded-lg border border-bone-soft/10 text-left transition hover:border-gold/40 hover:bg-bone-soft/3"
              style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}
            >
              <p style={{ color: '#F5F0E6', fontSize: '0.9rem', fontWeight: 500 }}>
                {city.name}
              </p>
              <p className="eyebrow" style={{ color: '#C8C0B0', fontSize: '9px', marginTop: '2px' }}>
                {city.region} · {city.province}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
