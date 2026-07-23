import { useMemo } from 'react'

export const SOLAR_TERMS = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
]

export const SEASON_CONFIG: Record<string, { accent: string; accentLight: string; label: string }> = {
  spring: { accent: '#4A7C59', accentLight: '#6A9C79', label: '春' },
  summer: { accent: '#C4553E', accentLight: '#E4755E', label: '夏' },
  autumn: { accent: '#B8860B', accentLight: '#D8A62B', label: '秋' },
  winter: { accent: '#4A6FA5', accentLight: '#6A8FC5', label: '冬' },
}

export const SEASON_MAP: Record<string, string> = {
  spring: '#4A7C59',
  summer: '#C4553E',
  autumn: '#B8860B',
  winter: '#4A6FA5',
}

export const TERM_START_DATES: Record<string, [number, number]> = {
  '小寒': [1, 5], '大寒': [1, 20], '立春': [2, 3], '雨水': [2, 18],
  '惊蛰': [3, 6], '春分': [3, 20], '清明': [4, 4], '谷雨': [4, 19],
  '立夏': [5, 5], '小满': [5, 21], '芒种': [6, 5], '夏至': [6, 21],
  '小暑': [7, 6], '大暑': [7, 23], '立秋': [8, 7], '处暑': [8, 22],
  '白露': [9, 7], '秋分': [9, 22], '寒露': [10, 8], '霜降': [10, 23],
  '立冬': [11, 7], '小雪': [11, 22], '大雪': [12, 6], '冬至': [12, 21],
}

/**
 * 计算当前节气是第几天
 */
export function calculateDayOfTerm(termName: string): number {
  const today = new Date()
  const start = TERM_START_DATES[termName]
  if (!start) return 1

  const [m, d] = start
  const termStart = new Date(today.getFullYear(), m - 1, d)
  const diff = Math.floor((today.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.min(15, diff + 1))
}

/**
 * 获取节气所在的季节
 */
export function getSeason(termName: string): string {
  const idx = SOLAR_TERMS.indexOf(termName)
  if (idx < 0) return 'summer'
  if (idx < 6) return 'spring'
  if (idx < 12) return 'summer'
  if (idx < 18) return 'autumn'
  return 'winter'
}

/**
 * 24 节气环 + 15 天内环
 */
export function DualRing({
  currentTerm,
  currentDay,
  size = 200,
}: {
  currentTerm: string
  currentDay: number
  size?: number
}) {
  const currentIndex = SOLAR_TERMS.findIndex(t => t === currentTerm)
  const season = getSeason(currentTerm)
  const accent = SEASON_CONFIG[season]?.accent || '#D4A843'

  // Scale all dimensions relative to size
  const scale = size / 200
  const cx = 100 * scale
  const cy = 100 * scale
  const outerRadius = 95 * scale
  const innerRadius = 55 * scale

  const outerStart = 210
  const outerEnd = -30
  const outerTotal = outerEnd - outerStart
  const outerStep = outerTotal / (SOLAR_TERMS.length - 1)

  const innerStart = 180
  const innerEnd = 0
  const innerTotal = innerEnd - innerStart
  const innerStep = innerTotal / 14

  const innerActiveSize = 8 * scale
  const outerActiveSize = 10 * scale
  const outerSeasonSize = 5 * scale
  const outerDefaultSize = 4 * scale
  const innerDefaultSize = 4 * scale
  const centerFontSize = 2 * scale

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: `${size}px`, height: `${size}px`, position: 'relative' }}>
        {/* 外环 - 24节气 */}
        {SOLAR_TERMS.map((term, idx) => {
          const angle = outerStart + idx * outerStep
          const rad = (angle * Math.PI) / 180
          const x = cx + outerRadius * Math.cos(rad)
          const y = cy + outerRadius * Math.sin(rad)
          const isActive = idx === currentIndex
          const termSeason = getSeason(term)
          const isCurrentSeason = termSeason === season

          let dotSize: number
          let dotBg: string
          let dotShadow: string

          if (isActive) {
            dotSize = outerActiveSize
            dotBg = accent
            dotShadow = `0 0 12px ${accent}80`
          } else if (isCurrentSeason) {
            dotSize = outerSeasonSize
            dotBg = 'rgba(212,168,67,0.2)'
            dotShadow = 'none'
          } else {
            dotSize = outerDefaultSize
            dotBg = 'rgba(245,240,230,0.12)'
            dotShadow = 'none'
          }

          return (
            <span
              key={term}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: dotBg,
                boxShadow: dotShadow,
                transition: 'all 0.4s ease',
              }}
            />
          )
        })}

        {/* 内环 - 15天 */}
        {Array.from({ length: 15 }, (_, i) => {
          const angle = innerStart + i * innerStep
          const rad = (angle * Math.PI) / 180
          const x = cx + innerRadius * Math.cos(rad)
          const y = cy + innerRadius * Math.sin(rad)
          const isActive = i === currentDay - 1

          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: isActive ? `${innerActiveSize}px` : `${innerDefaultSize}px`,
                height: isActive ? `${innerActiveSize}px` : `${innerDefaultSize}px`,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: isActive ? '#D4A843' : 'rgba(245,240,230,0.15)',
                boxShadow: isActive ? '0 0 8px rgba(212,168,67,0.8)' : 'none',
                transition: 'all 0.4s ease',
              }}
            />
          )
        })}

        {/* 中心天数 */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span className="solar-name" style={{ color: accent, fontSize: `${centerFontSize}rem` }}>
            {currentDay}
          </span>
        </div>
      </div>
    </div>
  )
}
