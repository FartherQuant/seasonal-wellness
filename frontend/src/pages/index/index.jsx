import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components'
import './index.scss'

class Index extends Component {
  state = {
    loading: true,
    solarTerm: null,
    plan: null,
    constitution: null,
    weather: null,
    nextTerm: null,
    countdown: null,
  }

  config = {
    navigationBarTitleText: '顺时养生',
    navigationBarBackgroundColor: '#2F4554',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true,
  }

  componentDidMount() {
    this.fetchData()
  }

  async fetchData() {
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

      // 获取方案
      const planRes = await Taro.request({
        url: `/api/wellness-plan?term=${term.term}&city=${city}&constitution=${constitution}&date=${today}`,
        method: 'GET',
      })
      const plan = planRes.data

      // 获取天气
      const weatherRes = await Taro.request({
        url: `/api/weather/${city}`,
        method: 'GET',
      })
      const weather = weatherRes.data

      this.setState({
        loading: false,
        solarTerm: term,
        plan,
        constitution,
        weather,
      })
    } catch (err) {
      this.setState({ loading: false })
      Taro.showToast({ icon: 'none', title: '数据加载失败' })
    }
  }

  onRefresh() {
    this.setState({ loading: true }, () => {
      this.fetchData()
      Taro.stopPullDownRefresh()
    })
  }

  goToPlanDetail() {
    Taro.navigateTo({ url: '/pages/plan/plan' })
  }

  goToAssessment() {
    Taro.navigateTo({ url: '/pages/assess/assess' })
  }

  render() {
    const { loading, solarTerm, plan, constitution } = this.state

    if (loading) {
      return <View className="loading">加载中...</View>
    }

    return (
      <ScrollView className="index" scrollY>
        {/* 节气卡片 */}
        <View className="solar-term-card">
          <Text className="term-name">{solarTerm?.term || '小暑'}</Text>
          <Text className="term-date">{solarTerm?.date || ''}</Text>
          <Text className="term-hou">{solarTerm?.climate_pattern || ''}</Text>
        </View>

        {/* 方案卡片 */}
        <View className="plan-card" onClick={() => this.goToPlanDetail()}>
          <Text className="plan-title">今日养生方案</Text>
          <View className="plan-summary">
            <Text className="plan-direction">{plan?.plan?.health?.direction || '清热祛湿，养心安神'}</Text>
            <Text className="plan-routine">睡眠：{plan?.plan?.daily_routine?.sleep || '夜卧早起'}</Text>
            <Text className="plan-diet">饮食：{plan?.plan?.diet?.recipes?.breakfast || '绿豆薏米粥'}</Text>
          </View>
        </View>

        {/* 花草茶卡片 */}
        <View className="tea-card">
          <Text className="tea-title">今日花草茶</Text>
          <Text className="tea-name">{plan?.plan?.herbal_tea?.primary?.name || '推荐花草茶'}</Text>
          <Text className="tea-ingredients">{(plan?.plan?.herbal_tea?.primary?.ingredients || []).join(', ')}</Text>
        </View>

        {/* 体质测评入口 */}
        <View className="constitution-card" onClick={() => this.goToAssessment()}>
          <Text className="constitution-text">当前体质：{constitution}</Text>
          <Text className="assessment-link">重新测评 →</Text>
        </View>

        {/* 免责声明 */}
        <Text className="disclaimer">
          本方案仅供参考，不构成医疗建议。特殊人群请遵医嘱。
        </Text>
      </ScrollView>
    )
  }
}

export default Index
