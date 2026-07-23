import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import './plan.scss'

class Plan extends Component {
  state = {
    loading: true,
    plan: null,
    constitution: null,
    term: null,
  }

  componentDidMount() {
    this.fetchPlan()
  }

  async fetchPlan() {
    const today = new Date().toISOString().split('T')[0]
    const userId = await Taro.getStorageSync('userId') || 'default_user'
    const city = await Taro.getStorageSync('city') || '北京'

    try {
      // 获取当前节气
      const termRes = await Taro.request({
        url: `/api/solar-term/current?date=${today}`,
        method: 'GET',
      })
      const term = termRes.data

      // 获取用户体质
      let constitution = '平和质'
      const constitutionRes = await Taro.request({
        url: `/api/constitution/user/${userId}`,
        method: 'GET',
      })
      if (constitutionRes.statusCode === 200) {
        constitution = constitutionRes.data.constitution
      }

      // 获取完整方案
      const planRes = await Taro.request({
        url: `/api/wellness-plan?term=${term.term}&city=${city}&constitution=${constitution}&date=${today}`,
        method: 'GET',
      })
      const plan = planRes.data

      this.setState({
        loading: false,
        plan,
        constitution,
        term,
      })
    } catch (err) {
      this.setState({ loading: false })
      Taro.showToast({ icon: 'none', title: '数据加载失败' })
    }
  }

  render() {
    const { loading, plan, term } = this.state

    if (loading) {
      return <View className="loading">加载中...</View>
    }

    const health = plan?.plan?.health || {}
    const routine = plan?.plan?.daily_routine || {}
    const diet = plan?.plan?.diet || {}
    const tea = plan?.plan?.herbal_tea || {}

    return (
      <ScrollView className="plan" scrollY>
        {/* 节气信息 */}
        <View className="term-info">
          <Text className="term-name">{term?.term || '小暑'}</Text>
          <Text className="term-meta">{term?.date || ''} · {term?.climate_pattern || ''}</Text>
        </View>

        {/* 健康建议 */}
        <View className="section">
          <Text className="section-title">健康建议</Text>
          <View className="health-section">
            <Text className="direction">{health.direction}</Text>
            <Text className="sub-title">高风险提示</Text>
            {(health.high_risk || []).map((risk, i) => (
              <Text key={i} className="risk-item">• {risk}</Text>
            ))}
            <Text className="sub-title">预防建议</Text>
            {(health.prevention || []).map((sug, i) => (
              <Text key={i} className="suggestion-item">• {sug}</Text>
            ))}
            <Text className="vulnerability">{health.vulnerability}</Text>
          </View>
        </View>

        {/* 起居建议 */}
        <View className="section">
          <Text className="section-title">起居建议</Text>
          <View className="routine-section">
            <Text className="routine-item">睡眠：{routine.sleep}</Text>
            <Text className="routine-item">运动：{routine.exercise}</Text>
            <Text className="routine-item">情志：{routine.emotion}</Text>
          </View>
        </View>

        {/* 饮食方案 */}
        <View className="section">
          <Text className="section-title">饮食方案</Text>
          <View className="diet-section">
            {diet.recipes?.breakfast && (
              <View className="meal-card">
                <Text className="meal-title">早餐</Text>
                <Text className="meal-content">{diet.recipes.breakfast}</Text>
              </View>
            )}
            {diet.recipes?.lunch && (
              <View className="meal-card">
                <Text className="meal-title">午餐</Text>
                <Text className="meal-content">{diet.recipes.lunch}</Text>
              </View>
            )}
            {diet.recipes?.dinner && (
              <View className="meal-card">
                <Text className="meal-title">晚餐</Text>
                <Text className="meal-content">{diet.recipes.dinner}</Text>
              </View>
            )}
            {diet.recipes?.soup && (
              <View className="meal-card">
                <Text className="meal-title">养生汤</Text>
                <Text className="meal-content">{diet.recipes.soup}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 花草茶 */}
        <View className="section">
          <Text className="section-title">今日花草茶</Text>
          <View className="tea-section">
            {tea.primary && (
              <View className="tea-card">
                <Text className="tea-card-title">{tea.primary.name}</Text>
                <Text className="tea-card-content">
                  食材：{tea.primary.ingredients?.join(', ')}
                </Text>
                <Text className="tea-card-content">
                  冲泡：{tea.primary.preparation}
                </Text>
                <Text className="tea-card-note">{tea.primary.note}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 免责声明 */}
        <Text className="disclaimer">
          {plan?.disclaimer || '本方案仅供参考，不构成医疗建议。特殊人群请遵医嘱。'}
        </Text>
      </ScrollView>
    )
  }
}

export default Plan
