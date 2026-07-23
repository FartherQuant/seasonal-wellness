import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Constitution } from '@/api/client'
import { getConstitutionResult } from '@/lib/storage'

const constitutionInfoMap: Record<string, Constitution> = {
  '平和质': { type: '平和质', name: '平和质', description: '阴阳气血调和，体态适中，面色红润，精力充沛，适应能力强。', characteristics: ['面色红润', '精力充沛', '适应力强'], features: [], diet_advice: ['饮食有节', '作息规律', '适量运动'], wellness_principle: '维持平衡，顺应节气养生', lifestyle_advice: ['保持规律作息', '均衡饮食'], key_advice: [], vulnerable_seasons: ['无特别脆弱季节'] },
  '气虚质': { type: '气虚质', name: '气虚质', description: '元气不足，易疲乏，气短懒言，易出汗，肢体倦怠，易感冒。', characteristics: ['疲乏', '气短', '懒言', '动则出汗'], features: [], diet_advice: ['多食黄芪、党参、山药', '避免过劳和生冷'], wellness_principle: '补气健脾，固表护卫', lifestyle_advice: ['避免过度劳累', '适当运动增强体质'], key_advice: [], vulnerable_seasons: ['春季', '秋季'] },
  '阳虚质': { type: '阳虚质', name: '阳虚质', description: '阳气不足，怕冷，手足不温，喜热饮食，精神不振，大便稀溏。', characteristics: ['怕冷', '手足不温', '喜热饮', '大便稀溏'], features: [], diet_advice: ['多食生姜、桂圆、羊肉', '避免寒凉食物'], wellness_principle: '温阳散寒，温补肾阳', lifestyle_advice: ['注意保暖', '避免过度运动'], key_advice: [], vulnerable_seasons: ['冬季', '春季'] },
  '阴虚质': { type: '阴虚质', name: '阴虚质', description: '阴液亏少，口燥咽干，五心烦热，小便短赤，大便偏干，易失眠。', characteristics: ['口燥咽干', '手足心热', '易失眠'], features: [], diet_advice: ['多食银耳、百合、梨、石斛', '避免辛辣和熬夜'], wellness_principle: '养阴润燥，滋阴降火', lifestyle_advice: ['保持充足睡眠', '避免辛辣刺激'], key_advice: [], vulnerable_seasons: ['夏季', '秋季'] },
  '痰湿质': { type: '痰湿质', name: '痰湿质', description: '痰湿凝聚，形体肥胖，腹部肥满，胸闷，痰多，面垢油光，易困倦。', characteristics: ['肥胖', '胸闷', '痰多', '腹胀'], features: [], diet_advice: ['多食薏米、赤小豆、冬瓜', '避免油腻和甜食'], wellness_principle: '化痰祛湿，健脾理气', lifestyle_advice: ['控制饮食', '避免久坐'], key_advice: [], vulnerable_seasons: ['夏季', '长夏'] },
  '湿热质': { type: '湿热质', name: '湿热质', description: '湿热内蕴，面垢油光，易生痤疮，口苦口干，身重困倦，小便黄。', characteristics: ['口苦', '易长痘', '小便黄', '大便黏腻'], features: [], diet_advice: ['多食绿豆、冬瓜、苦瓜', '避免辛辣和油炸'], wellness_principle: '清热利湿，调理脾胃', lifestyle_advice: ['保持清淡饮食', '避免辛辣油炸'], key_advice: [], vulnerable_seasons: ['夏季', '长夏'] },
  '血瘀质': { type: '血瘀质', name: '血瘀质', description: '血行不畅，肤色晦暗，色素沉着，容易出现瘀斑，口唇黯淡，易痛经。', characteristics: ['面色晦暗', '易长斑', '痛经', '关节痛'], features: [], diet_advice: ['多食山楂、玫瑰花、红糖', '避免生冷和久坐'], wellness_principle: '活血化瘀，疏通气血', lifestyle_advice: ['适当运动', '避免久坐不动'], key_advice: [], vulnerable_seasons: ['冬季', '春季'] },
  '气郁质': { type: '气郁质', name: '气郁质', description: '气机郁滞，精神不爽，胸胁胀满，善太息，易烦闷不乐，情绪波动大。', characteristics: ['情绪低落', '胸闷', '喜太息', '易怒'], features: [], diet_advice: ['多食玫瑰花、薄荷、佛手', '避免压抑和过度思虑'], wellness_principle: '疏肝解郁，调畅情志', lifestyle_advice: ['保持心情舒畅', '适当运动'], key_advice: [], vulnerable_seasons: ['春季', '秋季'] },
  '特禀质': { type: '特禀质', name: '特禀质', description: '先天禀赋异常，易过敏，易感冒，易哮喘，皮肤敏感。', characteristics: ['易过敏', '易感冒', '易哮喘', '皮肤敏感'], features: [], diet_advice: ['多食黄芪、大枣、山药', '避免海鲜、芒果、菠萝'], wellness_principle: '益气固表，抗过敏', lifestyle_advice: ['避免接触过敏原', '保持环境卫生'], key_advice: [], vulnerable_seasons: ['春季', '秋季'] },
}

const constitutionColors: Record<string, string> = {
  '平和质': '#4A7C59', '气虚质': '#6A8FC5', '阳虚质': '#E4755E', '阴虚质': '#C4553E',
  '痰湿质': '#6A9C79', '湿热质': '#D8A62B', '血瘀质': '#8B6BA8', '气郁质': '#4A6FA5', '特禀质': '#E8C96B',
}

export default function ConstitutionPage() {
  const [allConstitutions, setAllConstitutions] = useState<Constitution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getConstitutionDetails()
      .then(data => {
        const types = Array.isArray(data?.types) ? data.types : Object.keys(constitutionInfoMap)
        setAllConstitutions(types.map(type => constitutionInfoMap[type] || { type, name: type, description: '', characteristics: [], features: [], diet_advice: [], wellness_principle: '', lifestyle_advice: [], key_advice: [], vulnerable_seasons: [] }))
      })
      .catch(err => {
        setAllConstitutions(Object.values(constitutionInfoMap))
        setError(err.message)
      })
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

  const result = getConstitutionResult()
  const hasResult = !!result

  // === Has result: show single constitution ===
  if (hasResult && result.constitution) {
    const constitution = allConstitutions.find(c => c.type === result.constitution) || constitutionInfoMap[result.constitution]
    const accent = constitutionColors[result.constitution] || '#C8C0B0'

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>我的体质</h2>
            <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>YOUR CONSTITUTION · 基于测评结果</p>
          </div>
          <Link to="/assess" className="eyebrow px-3 py-2 rounded-lg border border-gold/40" style={{ color: '#D4A843' }}>
            → 再次测评
          </Link>
        </div>

        {constitution && (
          <div className="flex-1 flex flex-col rounded-lg border border-gold/20 p-6" style={{ backgroundColor: 'rgba(212,168,67,0.03)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ background: accent }} />
              <h3 className="solar-name" style={{ color: accent, fontSize: '2rem' }}>
                {constitution.type}
              </h3>
              {result.confidence && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="eyebrow" style={{ color: '#C8C0B0' }}>
                    可信度：{result.confidence === 'high' ? '高' : result.confidence === 'medium' ? '中' : '低'}
                  </span>
                  <span className="eyebrow" style={{ color: '#C8C0B0' }}>
                    （每次换季后需要重新评测）
                  </span>
                </div>
              )}
            </div>

            <p style={{ color: '#F5F0E6', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {constitution.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.5rem' }}>特征</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {constitution.characteristics.join(' · ')}
                </p>
              </div>
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.5rem' }}>脆弱季节</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {constitution.vulnerable_seasons.join(' · ')}
                </p>
              </div>
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.5rem' }}>食养</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {constitution.diet_advice.join(' · ')}
                </p>
              </div>
              <div>
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.5rem' }}>起居</span>
                <p style={{ color: '#F5F0E6', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {constitution.lifestyle_advice.join(' · ')}
                </p>
              </div>
            </div>

            {constitution.wellness_principle && (
              <div className="mt-6 pt-4 border-t border-bone-soft/8">
                <span className="eyebrow" style={{ color: '#C8C0B0', display: 'block', marginBottom: '0.3rem' }}>养生原则</span>
                <p style={{ color: accent, fontSize: '0.9rem' }}>{constitution.wellness_principle}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // === No result: show all 9 types ===
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="solar-name" style={{ fontSize: '1.5rem', color: '#F5F0E6' }}>九种体质</h2>
          <p className="eyebrow" style={{ color: '#C8C0B0', marginTop: '0.25rem' }}>NINE CONSTITUTIONS · 因人而异，因材施教</p>
        </div>
        <Link to="/assess" className="eyebrow px-3 py-2 rounded-lg border border-gold/40" style={{ color: '#D4A843' }}>
          → 开始测评
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:h-[calc(100vh-130px)]">
        {allConstitutions.map((constitution, i) => {
          const accent = constitutionColors[constitution.type as keyof typeof constitutionColors] || '#C8C0B0'
          return (
            <div
              key={i}
              className="flex flex-col rounded-lg p-4 border border-bone-soft/8"
              style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
                <h3 style={{ color: accent, fontWeight: 600, fontSize: '0.95rem' }}>{constitution.type}</h3>
              </div>
              <p style={{ color: '#C8C0B0', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {constitution.description}
              </p>
              <div className="mt-auto space-y-2">
                <div>
                  <span className="eyebrow" style={{ color: '#C8C0B0', fontSize: '9px' }}>特征</span>
                  <p style={{ color: '#F5F0E6', fontSize: '0.75rem' }}>
                    {constitution.characteristics.slice(0, 3).join(' · ')}
                  </p>
                </div>
                <div>
                  <span className="eyebrow" style={{ color: '#C8C0B0', fontSize: '9px' }}>食养</span>
                  <p style={{ color: '#F5F0E6', fontSize: '0.75rem' }}>
                    {constitution.diet_advice.slice(0, 1).join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
