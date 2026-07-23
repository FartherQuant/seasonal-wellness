import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Text, Button, Progress } from '@tarojs/components'
import './assess.scss'

class Assess extends Component {
  state = {
    currentQuestion: 0,
    answers: [],
    questionnaire: null,
    loading: true,
    result: null,
    submitting: false,
  }

  componentDidMount() {
    this.loadQuestionnaire()
  }

  async loadQuestionnaire() {
    try {
      const res = await Taro.request({
        url: '/api/constitution/questionnaire',
        method: 'GET',
      })
      this.setState({
        questionnaire: res.data,
        loading: false,
      })
    } catch (err) {
      this.setState({ loading: false })
      Taro.showToast({ title: '加载问卷失败', icon: 'none' })
    }
  }

  handleAnswer(value) {
    const { currentQuestion, answers } = this.state
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = { questionId: currentQuestion + 1, value }

    if (currentQuestion < 7) {
      this.setState({ currentQuestion: currentQuestion + 1, answers: newAnswers })
    } else {
      this.submitAssessment(newAnswers)
    }
  }

  async submitAssessment(answers) {
    this.setState({ submitting: true })
    const userId = await Taro.getStorageSync('userId') || 'default_user'

    try {
      const res = await Taro.request({
        url: '/api/constitution/assess',
        method: 'POST',
        data: { userId, answers },
      })
      this.setState({ result: res.data, submitting: false })
      Taro.showToast({ title: '测评完成', icon: 'success' })
    } catch (err) {
      this.setState({ submitting: false })
      Taro.showToast({ title: '提交失败', icon: 'none' })
    }
  }

  renderQuestion() {
    const { currentQuestion, questionnaire } = this.state
    if (!questionnaire) return null

    const question = questionnaire.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questionnaire.questions.length) * 100

    return (
      <View className="question">
        <Progress percent={progress} strokeWidth={8} activeColor="#2F4554" />
        <Text className="progress-text">{currentQuestion + 1} / {questionnaire.questions.length}</Text>

        <Text className="question-text">{question.question}</Text>

        <View className="options">
          <Button className="option-btn yes" onClick={() => this.handleAnswer(1)}>是</Button>
          <Button className="option-btn no" onClick={() => this.handleAnswer(0)}>否</Button>
        </View>
      </View>
    )
  }

  renderResult() {
    const { result } = this.state
    if (!result) return null

    return (
      <View className="result">
        <Text className="result-title">您的体质类型</Text>
        <Text className="constitution-name">{result.constitution}</Text>
        {result.is_mixed && (
          <Text className="mixed-types">混合体质：{result.constitution_types.join('、')}</Text>
        )}
        <Text className="description">{result.constitution_info.description}</Text>

        <View className="features">
          <Text className="features-title">体质特征</Text>
          {result.constitution_info.features.map((feature, i) => (
            <Text key={i} className="feature-item">• {feature}</Text>
          ))}
        </View>

        <View className="advice">
          <Text className="advice-title">养生建议</Text>
          <Text className="advice-text">{result.constitution_info.wellness_principle}</Text>
          <Text className="advice-text">{result.constitution_info.key_advice}</Text>
        </View>

        <View className="result-actions">
          <Button className="action-btn" onClick={() => this.resetAssessment()}>
            重新测评
          </Button>
          <Button className="action-btn" onClick={() => Taro.navigateBack()}>
            返回首页
          </Button>
        </View>

        <Text className="result-note">{result.note}</Text>
      </View>
    )
  }

  resetAssessment() {
    this.setState({ currentQuestion: 0, answers: [], result: null })
  }

  render() {
    const { loading, result, submitting } = this.state

    if (loading) {
      return <View className="loading">加载问卷中...</View>
    }

    if (submitting) {
      return <View className="loading">计算结果中...</View>
    }

    if (result) {
      return this.renderResult()
    }

    return this.renderQuestion()
  }
}

export default Assess
