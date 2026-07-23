import Taro from '@tarojs/taro'
import React, { Component } from 'react'

class App extends Component {
  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // H5 端 Taro 会通过路由自动挂载当前页面，
  // App 本身只作为壳，不在此返回子页面（避免重复渲染导致 ensure 失败）
  render() {
    return this.props.children || null
  }
}

export default App
