// API 客户端
const API_BASE = '/api'

// 节气类型 - 匹配后端返回的实际字段
export interface SolarTerm {
  name: string
  term: string
  solar_longitude: string
  date_range: string
  climate_pattern: string
  climate: string
  yinyang: string
  yin_yang: string
  tcm_organ: string
  tcm_organ_command: string
  wellness_direction: string
  vulnerability_points: string[]
  three_pentads: string[]
  description: string
  season: string
}

// 体质类型
export interface Constitution {
  type: string
  name: string
  description: string
  characteristics: string[]
  features: string[]
  diet_advice: string[]
  wellness_principle: string
  lifestyle_advice: string[]
  key_advice: string[]
  vulnerable_seasons: string[]
}

// 养生方案类型
export interface WellnessPlan {
  solar_term: string
  term: string
  constitution: string
  health_advice: string[]
  health: string[]
  routine_advice: string[]
  daily_routine: string[]
  diet_advice: string[]
  diet: string[]
  warning: string[]
  disclaimer: string
}

// 食谱类型
export interface Recipe {
  breakfast: string
  lunch: string
  dinner: string
  soup: string
  meta: {
    solar_term: string
    constitution_type: string
    weather_adjusted: boolean
    weather_weights?: any
  }
}

// 花草茶类型
export interface HerbalTea {
  solar_term: string
  term: string
  constitution: string
  tea_direction: string
  primary_tea: {
    name: string
    ingredients: string[]
    preparation: string
    note: string
  }
  backup_tea: {
    name: string
    ingredients: string[]
    preparation: string
    note: string
  }
  weather_note: string
}

// 体质测评问卷类型
export interface Questionnaire {
  questions: Array<{
    id: string
    question: string
    options: Array<{
      text: string
      value: number
    }>
  }>
}

// API 请求封装
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error)
  }
  
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }
  
  return data as T
}

// API 客户端对象
export const api = {
  // 节气相关
  getCurrentSolarTerm: () => apiRequest<SolarTerm>('/solar-term/current'),
  getAllSolarTerms: () => apiRequest<SolarTerm[]>('/solar-term'),
  getSolarTerm: (name: string) => apiRequest<SolarTerm>(`/solar-term/${name}`),
  
  // 养生方案 - 需要 term 参数
  getWellnessPlan: async (constitution: string, term?: string, date?: string) => {
    const termName = term || (await api.getCurrentSolarTerm()).term
    const params = date ? `&date=${date}` : ''
    return apiRequest<WellnessPlan>(`/wellness-plan?term=${termName}&constitution=${constitution}${params}`)
  },
  
  // 食谱 - 需要 term 参数
  getDailyRecipe: async (constitution: string, term?: string, date?: string, refresh?: boolean) => {
    const termName = term || (await api.getCurrentSolarTerm()).term
    const params = date ? `&date=${date}` : (refresh ? '&refresh=1' : '')
    return apiRequest<Recipe>(`/recipe/daily?term=${termName}&constitution=${constitution}${params}`)
  },
  
  // 花草茶 - 需要 term 参数
  getDailyTea: async (constitution: string, term?: string, date?: string, refresh?: boolean) => {
    const termName = term || (await api.getCurrentSolarTerm()).term
    const params = date ? `&date=${date}` : (refresh ? '&refresh=1' : '')
    return apiRequest<HerbalTea>(`/tea/daily?term=${termName}&constitution=${constitution}${params}`)
  },
  
  // 体质 - 直接返回数据
  getConstitutionDetails: () => apiRequest<{ types: string[] }>('/constitution/types'),
  getQuestionnaire: () => apiRequest<Questionnaire>('/constitution/questionnaire'),
  submitAssessment: (answers: Record<string, number>) => 
    apiRequest<{ constitution: string; description: string }>('/constitution/assess', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'web-user',
        // Backend expects answers as an array of 8 elements (boolean-ish: 1 = yes)
        answers: Object.keys(answers)
          .sort((a, b) => Number(a) - Number(b))
          .map(k => Number(answers[k])),
      }),
    }),
  
  // 天气 - 每天首次直连 API，之后返回浏览器缓存
  getWeather: async (city: string) => {
    // 先检查浏览器缓存
    const cached = (() => {
      try {
        const raw = localStorage.getItem(`weather_cache_${city}`)
        if (raw) {
          const today = new Date().toISOString().slice(0, 10)
          const cache = JSON.parse(raw)
          if (cache.date === today && cache.data) return cache.data
        }
      } catch { /* ignore */ }
      return null
    })()

    if (cached) return cached

    // 直连 API 获取最新数据
    const data = await apiRequest<any>(`/weather/${encodeURIComponent(city)}`)

    // 写入浏览器缓存
    try {
      const today = new Date().toISOString().slice(0, 10)
      localStorage.setItem(`weather_cache_${city}`, JSON.stringify({ date: today, data }))
    } catch { /* localStorage 满或不可用时忽略 */ }

    return data
  },
  getCities: () => apiRequest<{ cities: Array<{ name: string; province: string; region: string }>; total: number }>(`/weather/cities`).then(r => r.cities),

  // 健康检查
  healthCheck: () => apiRequest<{ status: string; message: string }>('/health'),
}

export default api
