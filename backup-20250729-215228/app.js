// app.js
App({
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    token: '',
    socketConnected: false,
    apiBaseUrl: 'https://api.example.com', // 替换为实际的API地址
    socketUrl: 'wss://api.example.com/ws', // 替换为实际的WebSocket地址
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    // 检查登录状态
    this.checkLoginStatus()
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    // 如果已登录但WebSocket未连接，尝试连接
    if (this.globalData.isLoggedIn && !this.globalData.socketConnected) {
      this.connectWebSocket()
    }
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    // 可以在这里做一些清理工作
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    console.error('小程序错误：', msg)
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    // 从本地存储获取登录信息
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (token && userInfo) {
      // 设置登录状态
      this.globalData.isLoggedIn = true
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      
      // 验证token有效性
      this.verifyToken(token)
      
      // 连接WebSocket
      this.connectWebSocket()
    }
  },

  /**
   * 验证token有效性
   */
  verifyToken: function (token) {
    wx.request({
      url: this.globalData.apiBaseUrl + '/auth/verify',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode !== 200 || !res.data.success) {
          // token无效，清除登录状态
          this.clearLoginStatus()
        }
      },
      fail: (err) => {
        console.error('验证token失败', err)
        // 网络错误，暂时保留登录状态
      }
    })
  },

  /**
   * 设置登录状态
   */
  setLoginStatus: function (token, userInfo) {
    // 更新全局数据
    this.globalData.isLoggedIn = true
    this.globalData.token = token
    this.globalData.userInfo = userInfo
    
    // 保存到本地存储
    wx.setStorageSync('token', token)
    wx.setStorageSync('userInfo', userInfo)
    
    // 连接WebSocket
    this.connectWebSocket()
  },

  /**
   * 清除登录状态
   */
  clearLoginStatus: function () {
    // 更新全局数据
    this.globalData.isLoggedIn = false
    this.globalData.token = ''
    this.globalData.userInfo = null
    
    // 清除本地存储
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    
    // 关闭WebSocket连接
    this.closeWebSocket()
  },

  /**
   * 连接WebSocket
   */
  connectWebSocket: function () {
    // 如果已经连接，则不重复连接
    if (this.globalData.socketConnected) {
      return
    }
    
    // 连接WebSocket
    wx.connectSocket({
      url: this.globalData.socketUrl + '?token=' + this.globalData.token,
      success: () => {
        console.log('WebSocket连接成功')
      },
      fail: (err) => {
        console.error('WebSocket连接失败', err)
      }
    })
    
    // 监听WebSocket连接打开事件
    wx.onSocketOpen(() => {
      console.log('WebSocket连接已打开')
      this.globalData.socketConnected = true
    })
    
    // 监听WebSocket错误事件
    wx.onSocketError((err) => {
      console.error('WebSocket错误', err)
      this.globalData.socketConnected = false
    })
    
    // 监听WebSocket连接关闭事件
    wx.onSocketClose(() => {
      console.log('WebSocket连接已关闭')
      this.globalData.socketConnected = false
      
      // 如果用户仍然登录，尝试重新连接
      if (this.globalData.isLoggedIn) {
        setTimeout(() => {
          this.connectWebSocket()
        }, 3000) // 3秒后重试
      }
    })
  },

  /**
   * 关闭WebSocket连接
   */
  closeWebSocket: function () {
    if (this.globalData.socketConnected) {
      wx.closeSocket()
      this.globalData.socketConnected = false
    }
  }
})