/**
 * 卡片栈主页面 — 视觉重铸版
 * 
 * 设计系统：
 *   - 四季色彩：根据当前节气自动选择背景色调
 *   - 节气环（Solar Term Ring）：24 点弧线，当前节气金色高亮
 *   - 字体：Inter（display/body）+ JetBrains Mono（数据）
 *   - 色彩 Tokens：
 *       ink-deep:    #1A1F2E  (深底)
 *       ink-soft:    #2F4554  (次级底)
 *       bone:        #F5F0E6  (主文字)
 *       bone-soft:   #C8C0B0  (次文字)
 *       gold:        #D4A843  (节气环/高亮)
 *       solar-spring:#4A7C59  (春季)
 *       solar-summer:#C4553E  (夏季)
 *       solar-autumn:#B8860B  (秋季)
 *       solar-winter:#4A6FA5  (冬季)
 */
import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Swiper, SwiperItem, Text, Picker } from '@tarojs/components'
import './index.scss'

// ============================================================
// 四季色彩映射（24 节气 → 季节色）
// ============================================================
const SEASON_COLORS = {
  spring: {
    primary: '#4A7C59',
    secondary: '#3A6A4A',
    gradient: 'linear-gradient(135deg, #2a4a3a 0%, #4A7C59 50%, #3a6a4a 100%)',
    ringColor: '#4A7C59',
  },
  summer: {
    primary: '#C4553E',
    secondary: '#A84530',
    gradient: 'linear-gradient(135deg, #5a2a20 0%, #C4553E 50%, #A84530 100%)',
    ringColor: '#C4553E',
  },
  autumn: {
    primary: '#B8860B',
    secondary: '#9A7008',
    gradient: 'linear-gradient(135deg, #5a4a1a 0%, #B8860B 50%, #9A7008 100%)',
    ringColor: '#B8860B',
  },
  winter: {
    primary: '#4A6FA5',
    secondary: '#3A5A8A',
    gradient: 'linear-gradient(135deg, #2a3a5a 0%, #4A6FA5 50%, #3A5A8A 100%)',
    ringColor: '#4A6FA5',
  },
}

// 24 节气顺序 + 季节分组
const SOLAR_TERMS = [
  { name: '立春', season: 'spring' },
  { name: '雨水', season: 'spring' },
  { name: '惊蛰', season: 'spring' },
  { name: '春分', season: 'spring' },
  { name: '清明', season: 'spring' },
  { name: '谷雨', season: 'spring' },
  { name: '立夏', season: 'summer' },
  { name: '小满', season: 'summer' },
  { name: '芒种', season: 'summer' },
  { name: '夏至', season: 'summer' },
  { name: '小暑', season: 'summer' },
  { name: '大暑', season: 'summer' },
  { name: '立秋', season: 'autumn' },
  { name: '处暑', season: 'autumn' },
  { name: '白露', season: 'autumn' },
  { name: '秋分', season: 'autumn' },
  { name: '寒露', season: 'autumn' },
  { name: '霜降', season: 'autumn' },
  { name: '立冬', season: 'winter' },
  { name: '小雪', season: 'winter' },
  { name: '大雪', season: 'winter' },
  { name: '冬至', season: 'winter' },
  { name: '小寒', season: 'winter' },
  { name: '大寒', season: 'winter' },
]

// 体质类型到色彩的映射
const CONSTITUTION_COLORS = {
  '平和质': { ring: '#4A7C59', label: '阴阳调和' },
  '气虚质': { ring: '#C4553E', label: '元气不足' },
  '阳虚质': { ring: '#4A6FA5', label: '阳气不足' },
  '阴虚质': { ring: '#8B6BA8', label: '阴液亏少' },
  '痰湿质': { ring: '#B8860B', label: '痰湿凝聚' },
  '湿热质': { ring: '#C4553E', label: '湿热内蕴' },
  '血瘀质': { ring: '#8B3A4A', label: '血行不畅' },
  '气郁质': { ring: '#7A6BA8', label: '气机郁滞' },
  '特禀质': { ring: '#5A8B7A', label: '先天失常' },
}

// ============================================================
// 卡片数据模型（按类型定义，不含图标）
// ============================================================
const CARD_DATA = [
  { id: 'solar-term', type: 'solar-term' },
  { id: 'wellness-plan', type: 'wellness-plan' },
  { id: 'recipe', type: 'recipe' },
  { id: 'herbal-tea', type: 'herbal-tea' },
  { id: 'constitution', type: 'constitution' },
  { id: 'countdown', type: 'countdown' },
]

// 日期选项（今天/明天/后天）
const DATE_OPTIONS = [
  { label: '今', offset: 0 },
  { label: '明', offset: 1 },
  { label: '后', offset: 2 },
]

// ============================================================
// 工具函数：根据节气获取季节信息
// ============================================================
function getSeason(termName) {
  const term = SOLAR_TERMS.find(t => t.name === termName)
  return term ? SEASON_COLORS[term.season] : SEASON_COLORS.summer
}

// ============================================================
// 卡片渲染组件
// ============================================================
const SolarTermCard = ({ data, loading, season }) => (
  <View className="card solar-term-card" style={{ background: season.gradient }}>
    <View className="card-header">
      <Text className="eyebrow">SOLAR TERM</Text>
      <Text className="card-title">今日节气</Text>
    </View>
    <View className="card-body">
      {loading ? (
        <Text className="card-loading">加载中...</Text>
      ) : (
        <View className="solar-term-content">
          <Text className="term-name">{data?.term || '大暑'}</Text>
          <Text className="term-date">{data?.date || '7月22日'}</Text>
          <View className="divider" />
          <View className="term-info-grid">
            <View className="term-info-item">
              <Text className="term-info-label">气候</Text>
              <Text className="term-info-value">{data?.climate_pattern || '高温高湿，雷阵雨频繁'}</Text>
            </View>
            <View className="term-info-item">
              <Text className="term-info-label">阴阳</Text>
              <Text className="term-info-value">{data?.yinyang || '阳气极盛，阴气渐长'}</Text>
            </View>
            <View className="term-info-item">
              <Text className="term-info-label">当令</Text>
              <Text className="term-info-value">{data?.tcm_organ || '心火极盛，脾土需护'}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
    <View className="card-footer">
      <Text className="footer-text">右滑 → 养生方案</Text>
    </View>
  </View>
)

const WellnessPlanCard = ({ data, loading, season }) => (
  <View className="card wellness-plan-card" style={{ background: season.gradient }}>
    <View className="card-header">
      <Text className="eyebrow">WELLNESS PLAN</Text>
      <Text className="card-title">养生方案</Text>
    </View>
    <View className="card-body">
      {loading ? (
        <Text className="card-loading">加载中...</Text>
      ) : (
        <View className="plan-content">
          <View className="plan-direction">
            <Text className="direction-label">养生方向</Text>
            <Text className="direction-text">{data?.direction || '清热祛湿，养心安神'}</Text>
          </View>
          <View className="plan-grid">
            <View className="plan-cell">
              <Text className="cell-label">睡眠</Text>
              <Text className="cell-value">{data?.sleep || '夜卧早起'}</Text>
            </View>
            <View className="plan-cell">
              <Text className="cell-label">运动</Text>
              <Text className="cell-value">{data?.exercise || '适度散步'}</Text>
            </View>
            <View className="plan-cell">
              <Text className="cell-label">情志</Text>
              <Text className="cell-value">{data?.emotion || '保持平和心态'}</Text>
            </View>
          </View>
          <View className="plan-warnings">
            <Text className="warnings-label">健康提醒</Text>
            {(data?.health_high_risk || []).map((risk, idx) => (
              <Text key={idx} className="warning-item">
                <Text className="warning-dot" />
                {risk}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
    <View className="card-footer">
      <Text className="footer-text">右滑 → 每日食谱</Text>
    </View>
  </View>
)

const RecipeCard = ({ data, loading, season }) => (
  <View className="card recipe-card" style={{ background: season.gradient }}>
    <View className="card-header">
      <Text className="eyebrow">DAILY RECIPES</Text>
      <Text className="card-title">每日食谱</Text>
    </View>
    <View className="card-body">
      {loading ? (
        <Text className="card-loading">加载中...</Text>
      ) : (
        <View className="recipe-content">
          <View className="meal-section">
            <View className="meal-header">
              <Text className="meal-time">06:00</Text>
              <Text className="meal-label">早餐</Text>
            </View>
            <Text className="meal-item">{data?.breakfast || '红枣莲子粥'}</Text>
          </View>
          <View className="meal-section">
            <View className="meal-header">
              <Text className="meal-time">12:00</Text>
              <Text className="meal-label">午餐</Text>
            </View>
            <Text className="meal-item">{data?.lunch || '凉拌苦瓜'}</Text>
          </View>
          <View className="meal-section">
            <View className="meal-header">
              <Text className="meal-time">18:00</Text>
              <Text className="meal-label">晚餐</Text>
            </View>
            <Text className="meal-item">{data?.dinner || '冬瓜老鸭汤'}</Text>
          </View>
          <View className="meal-section">
            <View className="meal-header">
              <Text className="meal-time">全天</Text>
              <Text className="meal-label">汤品</Text>
            </View>
            <Text className="meal-item">{data?.soup || '绿豆汤'}</Text>
          </View>
        </View>
      )}
    </View>
    <View className="card-footer">
      <Text className="footer-text">右滑 → 花草茶</Text>
    </View>
  </View>
)

const HerbalTeaCard = ({ data, loading, season }) => (
  <View className="card herbal-tea-card" style={{ background: season.gradient }}>
    <View className="card-header">
      <Text className="eyebrow">HERBAL TEA</Text>
      <Text className="card-title">花草茶</Text>
    </View>
    <View className="card-body">
      {loading ? (
        <Text className="card-loading">加载中...</Text>
      ) : (
        <View className="tea-content">
          <Text className="tea-name">{data?.name || '生姜桂圆陈皮茶'}</Text>
          <Text className="tea-direction">{data?.direction || '温性清热'}</Text>
          <View className="divider" />
          <View className="tea-ingredients">
            <Text className="ingredients-label">配方</Text>
            {data?.ingredients?.map((item, idx) => (
              <Text key={idx} className="ingredient-item">{item}</Text>
            ))}
          </View>
          <View className="tea-prep">
            <Text className="prep-label">冲泡</Text>
            <Text className="prep-value">{data?.preparation || '沸水冲泡 10 分钟，温热饮用'}</Text>
          </View>
          <View className="tea-note-box">
            <Text className="note-text">{data?.note || '适合阳虚体质夏季饮用'}</Text>
          </View>
          {data?.alternative && (
            <View className="tea-alternative">
              <Text className="alternative-label">备选</Text>
              <Text className="alternative-name">{data.alternative}</Text>
            </View>
          )}
        </View>
      )}
    </View>
    <View className="card-footer">
      <Text className="footer-text">右滑 → 体质</Text>
    </View>
  </View>
)

const ConstitutionCard = ({ data, loading, season }) => {
  const color = CONSTITUTION_COLORS[data?.constitution || '阳虚质'] || { ring: '#4A6FA5', label: '待测评' }
  return (
    <View className="card constitution-card" style={{ background: season.gradient }}>
      <View className="card-header">
        <Text className="eyebrow">CONSTITUTION</Text>
        <Text className="card-title">体质</Text>
      </View>
      <View className="card-body">
        {loading ? (
          <Text className="card-loading">加载中...</Text>
        ) : (
          <View className="constitution-content">
            <View className="constitution-badge" style={{ borderColor: color.ring }}>
              <Text className="badge-label">{color.label}</Text>
            </View>
            <Text className="constitution-type">{data?.constitution || '阳虚质'}</Text>
            <Text className="constitution-desc">
              {data?.desc || '阳气不足，怕冷，手足不温，喜热饮食'}
            </Text>
            <View className="divider" />
            <View className="constitution-tags">
              {data?.tags?.map((tag, idx) => (
                <Text key={idx} className="tag">{tag}</Text>
              ))}
            </View>
            <View className="constitution-tip-box">
              <Text className="tip-label">调理建议</Text>
              <Text className="tip-text">{data?.tip || '多食生姜、桂圆、羊肉'}</Text>
            </View>
          </View>
        )}
      </View>
      <View className="card-footer">
        <Text className="footer-text">右滑 → 节气倒计时</Text>
      </View>
    </View>
  )
}

const CountdownCard = ({ data, loading, season }) => (
  <View className="card countdown-card" style={{ background: season.gradient }}>
    <View className="card-header">
      <Text className="eyebrow">COUNTDOWN</Text>
      <Text className="card-title">节气倒计时</Text>
    </View>
    <View className="card-body">
      {loading ? (
        <Text className="card-loading">加载中...</Text>
      ) : (
        <View className="countdown-content">
          <View className="countdown-current">
            <Text className="current-label">当前节气</Text>
            <Text className="current-name">{data?.current_term || '大暑'}</Text>
            <Text className="current-day">{data?.current_day || '初候'}</Text>
          </View>
          <View className="divider" />
          <View className="countdown-next">
            <Text className="next-label">下一节气</Text>
            <Text className="next-name">{data?.next_term || '立秋'}</Text>
          </View>
          <View className="countdown-days">
            <Text className="days-number">{data?.remaining_days || '15'}</Text>
            <Text className="days-label">天后</Text>
          </View>
          <Text className="countdown-note">顺应时节，调养身心</Text>
        </View>
      )}
    </View>
    <View className="card-footer">
      <Text className="footer-text">左滑 → 回到今日节气</Text>
    </View>
  </View>
)

// 卡片组件映射
const CARD_COMPONENTS = {
  'solar-term': SolarTermCard,
  'wellness-plan': WellnessPlanCard,
  'recipe': RecipeCard,
  'herbal-tea': HerbalTeaCard,
  'constitution': ConstitutionCard,
  'countdown': CountdownCard,
}

// ============================================================
// 主页面
// ============================================================
class CardStack extends Component {
  state = {
    loading: true,
    currentIndex: 0,
    cards: CARD_DATA,
    data: {
      'solar-term': null,
      'wellness-plan': null,
      'recipe': null,
      'herbal-tea': null,
      'constitution': null,
      'countdown': null,
    },
    dateOffset: 0,
    selectedDateLabel: '今',
    currentTerm: '大暑',
    season: SEASON_COLORS.summer,
  }

  config = {
    navigationBarTitleText: '顺时生活',
    navigationBarBackgroundColor: 'transparent',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1A1F2E',
    disableScroll: true,
  }

  componentDidMount() {
    this.fetchAllData()
  }

  getTargetDate(offset) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  async fetchAllData() {
    const { dateOffset } = this.state
    const targetDate = this.getTargetDate(dateOffset)
    const city = await Taro.getStorageSync('city') || '北京'

    this.setState({ loading: true })

    try {
      const termRes = await Taro.request({
        url: `/api/solar-term/current?date=${targetDate}`,
        method: 'GET',
      })
      const term = termRes.data
      const termName = term?.term || '大暑'
      const season = getSeason(termName)
      const constitution = await Taro.getStorageSync('constitution') || '阳虚质'

      const [planRes, teaRes] = await Promise.all([
        Taro.request({
          url: `/api/wellness-plan?term=${termName}&city=${city}&constitution=${constitution}&date=${targetDate}`,
          method: 'GET',
        }),
        Taro.request({
          url: `/api/tea/daily?term=${termName}&constitution=${constitution}&date=${targetDate}`,
          method: 'GET',
        }),
      ])

      const plan = planRes.data
      const tea = teaRes.data

      const cardData = {
        'solar-term': {
          term: termName,
          date: targetDate,
          climate_pattern: term?.climate_pattern || '高温高湿，雷阵雨频繁',
          yinyang: term?.yinyang || '阳气极盛，阴气渐长',
          tcm_organ: term?.tcm_organ || '心火极盛，脾土需护',
        },
        'wellness-plan': {
          direction: plan?.plan?.health?.direction || '清热祛湿，养心安神',
          sleep: plan?.plan?.daily_routine?.sleep || '夜卧早起',
          exercise: plan?.plan?.daily_routine?.exercise || '适度散步',
          emotion: plan?.plan?.daily_routine?.emotion || '保持平和心态',
          health_high_risk: plan?.plan?.health?.high_risk || ['防中暑'],
        },
        'recipe': {
          breakfast: plan?.plan?.diet?.recipes?.breakfast || '红枣莲子粥',
          lunch: plan?.plan?.diet?.recipes?.lunch || '凉拌苦瓜',
          dinner: plan?.plan?.diet?.recipes?.dinner || '冬瓜老鸭汤',
          soup: plan?.plan?.diet?.recipes?.soup || '绿豆汤',
        },
        'herbal-tea': {
          name: tea?.primary?.name || '生姜桂圆陈皮茶',
          direction: tea?.direction || '温性清热',
          ingredients: tea?.primary?.ingredients || ['生姜 3g', '桂圆 5g', '陈皮 3g'],
          preparation: tea?.primary?.preparation || '沸水冲泡 10 分钟，温热饮用',
          note: tea?.primary?.note || '适合阳虚体质夏季饮用',
          alternative: tea?.alternative?.name || null,
        },
        'constitution': {
          constitution,
          desc: this.getConstitutionDesc(constitution),
          tags: this.getConstitutionTags(constitution),
          tip: this.getConstitutionTip(constitution),
        },
        'countdown': {
          current_term: termName,
          current_day: plan?.hou || '初候',
          next_term: this.getNextTerm(termName),
          remaining_days: this.getRemainingDays(targetDate),
        },
      }

      this.setState({
        loading: false,
        data: cardData,
        currentTerm: termName,
        season,
      })
    } catch (err) {
      console.error('数据加载失败', err)
      this.setState({ loading: false })
    }
  }

  getConstitutionDesc(type) {
    const descMap = {
      '平和质': '阴阳气血调和，体态适中，面色红润，精力充沛',
      '气虚质': '元气不足，气短懒言，容易疲乏，易出汗',
      '阳虚质': '阳气不足，怕冷，手足不温，喜热饮食',
      '阴虚质': '阴液亏少，口燥咽干，手足心热，易失眠',
      '痰湿质': '痰湿凝聚，形体肥胖，腹部肥满，胸闷痰多',
      '湿热质': '湿热内蕴，面垢油光，易生痤疮，口苦口干',
      '血瘀质': '血行不畅，肤色晦暗，色素沉着，易出现瘀斑',
      '气郁质': '气机郁滞，神情抑郁，情绪不稳，易烦躁',
      '特禀质': '先天失常，易过敏，易患哮喘、荨麻疹等',
    }
    return descMap[type] || '请完成体质测评'
  }

  getConstitutionTags(type) {
    const tagMap = {
      '平和质': ['面色红润', '精力充沛', '睡眠良好', '二便正常'],
      '气虚质': ['气短懒言', '容易疲乏', '易出汗', '大便溏薄'],
      '阳虚质': ['怕冷', '手足不温', '喜热饮', '大便稀溏'],
      '阴虚质': ['口燥咽干', '手足心热', '易失眠', '大便干结'],
      '痰湿质': ['形体肥胖', '腹部肥满', '胸闷痰多', '口中黏腻'],
      '湿热质': ['面垢油光', '易生痤疮', '口苦口干', '小便黄'],
      '血瘀质': ['肤色晦暗', '色素沉着', '易瘀斑', '月经有血块'],
      '气郁质': ['神情抑郁', '情绪不稳', '易烦躁', '胸闷叹息'],
      '特禀质': ['易过敏', '易患哮喘', '易荨麻疹', '皮肤易起风团'],
    }
    return tagMap[type] || []
  }

  getConstitutionTip(type) {
    const tipMap = {
      '平和质': '保持当前生活方式，适度运动，规律作息',
      '气虚质': '多食黄芪、党参、山药；避免剧烈运动',
      '阳虚质': '多食生姜、桂圆、羊肉；冬季注意保暖',
      '阴虚质': '多食银耳、百合、梨；避免熬夜和辛辣',
      '痰湿质': '多食薏米、赤小豆、陈皮；少吃甜腻和肥肉',
      '湿热质': '多食绿豆、冬瓜、苦瓜；避免辛辣油腻',
      '血瘀质': '多食山楂、玫瑰花、红糖；避免久坐',
      '气郁质': '多食玫瑰花、佛手、陈皮；保持心情舒畅',
      '特禀质': '避免已知过敏原；多食黄芪、大枣',
    }
    return tipMap[type] || '根据体质调整'
  }

  getNextTerm(currentTerm) {
    const idx = SOLAR_TERMS.findIndex(t => t.name === currentTerm)
    return idx >= 0 ? SOLAR_TERMS[(idx + 1) % SOLAR_TERMS.length].name : '立秋'
  }

  getRemainingDays(targetDate) {
    const today = new Date()
    const target = new Date(targetDate)
    const diff = Math.floor((target - today) / (1000 * 60 * 60 * 24))
    return Math.max(0, 15 - diff)
  }

  onDateChange = (e) => {
    const index = parseInt(e.detail.value, 10)
    const option = DATE_OPTIONS[index]
    if (option) {
      this.setState(
        { dateOffset: option.offset, selectedDateLabel: option.label },
        () => this.fetchAllData()
      )
    }
  }

  onSwiperChange = (e) => {
    this.setState({ currentIndex: e.detail.current })
  }

  onTouchStart = () => {}

  /**
   * 渲染 24 节气环（SVG）
   * 弧线排列，当前节气金色高亮
   */
  renderSolarTermRing() {
    const { currentTerm, season } = this.state
    const currentIndex = SOLAR_TERMS.findIndex(t => t.name === currentTerm)

    // 弧线：从 210° 到 -30°（底部中央）
    const radius = 80
    const cx = 80
    const cy = 80
    const startAngle = 210
    const endAngle = -30
    const totalArc = endAngle - startAngle
    const step = totalArc / (SOLAR_TERMS.length - 1)

    return (
      <View className="solar-term-ring">
        <View className="ring-svg">
          {SOLAR_TERMS.map((term, idx) => {
            const angle = startAngle + idx * step
            const rad = (angle * Math.PI) / 180
            const x = cx + radius * Math.cos(rad)
            const y = cy + radius * Math.sin(rad)
            const isActive = idx === currentIndex
            const isCurrentSeason = term.season === SOLAR_TERMS[currentIndex]?.season

            return (
              <View
                key={term.name}
                className={`ring-dot ${isActive ? 'active' : ''} ${isCurrentSeason ? 'season-active' : ''}`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              />
            )
          })}
        </View>
        <Text className="ring-label">{currentTerm}</Text>
      </View>
    )
  }

  render() {
    const { loading, currentIndex, cards, data, selectedDateLabel, season } = this.state

    return (
      <View className="card-stack-container">
        {/* 顶部日期选择器 */}
        <View className="date-picker-wrapper">
          <Picker
            mode="selector"
            range={DATE_OPTIONS.map(o => o.label)}
            onChange={this.onDateChange}
          >
            <View className="date-picker">
              <Text className="date-label">{selectedDateLabel}</Text>
              <Text className="date-icon">▾</Text>
            </View>
          </Picker>
        </View>

        {/* 卡片 Swiper */}
        <Swiper
          className="card-swiper"
          current={currentIndex}
          onChange={this.onSwiperChange}
          onTouchStart={this.onTouchStart}
          circular={false}
          duration={400}
          easingFunction="ease-out"
          disableScroll={true}
        >
          {cards.map((card) => {
            const Component = CARD_COMPONENTS[card.type]
            return (
              <SwiperItem key={card.id}>
                <Component data={data[card.id]} loading={loading} season={season} />
              </SwiperItem>
            )
          })}
        </Swiper>

        {/* 底部 24 节气环 */}
        {this.renderSolarTermRing()}

        {/* 卡片索引 */}
        <View className="card-hint">
          <Text className="hint-text">{currentIndex + 1} / {cards.length}</Text>
        </View>
      </View>
    )
  }
}

export default CardStack
