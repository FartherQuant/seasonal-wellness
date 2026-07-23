/**
 * 体质测评结果存储 — 使用 sessionStorage（页面关闭即清除）
 */

const RESULT_KEY = 'constitution_result'

export interface ConstitutionResult {
  constitution: string
  description: string
  confidence: string
  scores: Record<string, number>
  features?: string[]
  wellness_principle?: string
  key_advice?: string
}

export function saveConstitutionResult(result: ConstitutionResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
}

export function getConstitutionResult(): ConstitutionResult | null {
  const raw = sessionStorage.getItem(RESULT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearConstitutionResult() {
  sessionStorage.removeItem(RESULT_KEY)
}

/**
 * 天气缓存 — localStorage，每天首次直连 API，之后返回缓存
 */

const WEATHER_CACHE_PREFIX = 'weather_cache_'

export interface WeatherCache {
  date: string  // YYYY-MM-DD
  data: any
}

export function getCachedWeather(city: string): any | null {
  const today = new Date().toISOString().slice(0, 10)
  const key = `${WEATHER_CACHE_PREFIX}${city}`
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const cache: WeatherCache = JSON.parse(raw)
    if (cache.date === today && cache.data) {
      return cache.data
    }
  } catch {
    return null
  }
  return null
}

export function cacheWeather(city: string, data: any): void {
  const today = new Date().toISOString().slice(0, 10)
  const key = `${WEATHER_CACHE_PREFIX}${city}`
  const cache: WeatherCache = { date: today, data }
  localStorage.setItem(key, JSON.stringify(cache))
}
