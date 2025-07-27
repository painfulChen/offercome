// pages/login/login.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前登录方式：phone(手机号登录)、wechat(微信登录)
    loginType: 'phone',
    // 手机号
    phoneNumber: '',
    // 验证码
    verificationCode: '',
    // 是否显示验证码输入框
    showVerificationInput: false,
    // 验证码倒计时
    countdown: 0,
    // 倒计时定时器
    countdownTimer: null,
    // 是否正在登录
    isLoggingIn: false,
    // 是否同意用户协议
    agreeToTerms: false,
    // 是否显示用户协议弹窗
    showTermsModal: false,
    // 是否显示隐私政策弹窗
    showPrivacyModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果已经登录，跳转到首页
    if (app.globalData.isLoggedIn) {
      this.navigateBack()
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 清除倒计时定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
  },

  /**
   * 切换登录方式
   */
  switchLoginType: function (e) {
    const loginType = e.currentTarget.dataset.type
    this.setData({ loginType })
  },

  /**
   * 输入手机号
   */
  inputPhoneNumber: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },

  /**
   * 输入验证码
   */
  inputVerificationCode: function (e) {
    this.setData({
      verificationCode: e.detail.value
    })
  },

  /**
   * 发送验证码
   */
  sendVerificationCode: function () {
    const phoneNumber = this.data.phoneNumber
    
    // 验证手机号格式
    if (!this.validatePhoneNumber(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '发送中...',
      mask: true
    })
    
    // 发送验证码请求
    wx.request({
      url: app.globalData.apiBaseUrl + '/auth/send-code',
      method: 'POST',
      data: {
        phoneNumber: phoneNumber
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 显示验证码输入框
          this.setData({
            showVerificationInput: true
          })
          
          // 开始倒计时
          this.startCountdown()
          
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: res.data.message || '发送验证码失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求发送验证码失败', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 开始倒计时
   */
  startCountdown: function () {
    // 设置初始倒计时时间（60秒）
    this.setData({
      countdown: 60
    })
    
    // 清除可能存在的定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
    
    // 创建新的定时器
    const countdownTimer = setInterval(() => {
      if (this.data.countdown <= 1) {
        // 倒计时结束，清除定时器
        clearInterval(countdownTimer)
        this.setData({
          countdown: 0,
          countdownTimer: null
        })
      } else {
        // 倒计时减1
        this.setData({
          countdown: this.data.countdown - 1
        })
      }
    }, 1000)
    
    this.setData({
      countdownTimer: countdownTimer
    })
  },

  /**
   * 验证手机号格式
   */
  validatePhoneNumber: function (phoneNumber) {
    // 中国大陆手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phoneNumber)
  },

  /**
   * 验证验证码格式
   */
  validateVerificationCode: function (code) {
    // 6位数字验证码
    const codeRegex = /^\d{6}$/
    return codeRegex.test(code)
  },

  /**
   * 手机号登录
   */
  phoneLogin: function () {
    const phoneNumber = this.data.phoneNumber
    const verificationCode = this.data.verificationCode
    
    // 验证手机号格式
    if (!this.validatePhoneNumber(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    
    // 验证验证码格式
    if (!this.validateVerificationCode(verificationCode)) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      })
      return
    }
    
    // 验证是否同意用户协议
    if (!this.data.agreeToTerms) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      })
      return
    }
    
    // 设置登录中状态
    this.setData({
      isLoggingIn: true
    })
    
    // 显示加载提示
    wx.showLoading({
      title: '登录中...',
      mask: true
    })
    
    // 发送登录请求
    wx.request({
      url: app.globalData.apiBaseUrl + '/auth/login',
      method: 'POST',
      data: {
        phoneNumber: phoneNumber,
        verificationCode: verificationCode,
        loginType: 'phone'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 保存登录信息
          const token = res.data.token
          const userInfo = res.data.userInfo
          
          // 更新全局数据
          app.globalData.isLoggedIn = true
          app.globalData.token = token
          app.globalData.userInfo = userInfo
          
          // 保存到本地存储
          wx.setStorageSync('token', token)
          wx.setStorageSync('userInfo', userInfo)
          
          // 登录成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 延迟返回，让用户看到登录成功提示
          setTimeout(() => {
            this.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('登录请求失败', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({
          isLoggingIn: false
        })
      }
    })
  },

  /**
   * 微信登录
   */
  wechatLogin: function () {
    // 验证是否同意用户协议
    if (!this.data.agreeToTerms) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      })
      return
    }
    
    // 设置登录中状态
    this.setData({
      isLoggingIn: true
    })
    
    // 显示加载提示
    wx.showLoading({
      title: '登录中...',
      mask: true
    })
    
    // 获取微信登录凭证
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 获取用户信息
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (profileRes) => {
              // 发送登录请求
              wx.request({
                url: app.globalData.apiBaseUrl + '/auth/login',
                method: 'POST',
                data: {
                  code: loginRes.code,
                  userInfo: profileRes.userInfo,
                  loginType: 'wechat'
                },
                success: (res) => {
                  if (res.statusCode === 200 && res.data.success) {
                    // 保存登录信息
                    const token = res.data.token
                    const userInfo = res.data.userInfo
                    
                    // 更新全局数据
                    app.globalData.isLoggedIn = true
                    app.globalData.token = token
                    app.globalData.userInfo = userInfo
                    
                    // 保存到本地存储
                    wx.setStorageSync('token', token)
                    wx.setStorageSync('userInfo', userInfo)
                    
                    // 登录成功提示
                    wx.showToast({
                      title: '登录成功',
                      icon: 'success'
                    })
                    
                    // 延迟返回，让用户看到登录成功提示
                    setTimeout(() => {
                      this.navigateBack()
                    }, 1500)
                  } else {
                    wx.showToast({
                      title: res.data.message || '登录失败',
                      icon: 'none'
                    })
                  }
                },
                fail: (err) => {
                  console.error('登录请求失败', err)
                  wx.showToast({
                    title: '网络错误，请稍后重试',
                    icon: 'none'
                  })
                },
                complete: () => {
                  wx.hideLoading()
                  this.setData({
                    isLoggingIn: false
                  })
                }
              })
            },
            fail: (err) => {
              console.error('获取用户信息失败', err)
              wx.hideLoading()
              this.setData({
                isLoggingIn: false
              })
              
              if (err.errMsg.indexOf('auth deny') > -1) {
                wx.showToast({
                  title: '您已拒绝授权',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '获取用户信息失败',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          console.error('微信登录失败', loginRes)
          wx.hideLoading()
          this.setData({
            isLoggingIn: false
          })
          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('微信登录失败', err)
        wx.hideLoading()
        this.setData({
          isLoggingIn: false
        })
        wx.showToast({
          title: '微信登录失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 切换同意用户协议状态
   */
  toggleAgreeToTerms: function () {
    this.setData({
      agreeToTerms: !this.data.agreeToTerms
    })
  },

  /**
   * 显示用户协议弹窗
   */
  showTerms: function () {
    this.setData({
      showTermsModal: true
    })
  },

  /**
   * 关闭用户协议弹窗
   */
  closeTerms: function () {
    this.setData({
      showTermsModal: false
    })
  },

  /**
   * 显示隐私政策弹窗
   */
  showPrivacy: function () {
    this.setData({
      showPrivacyModal: true
    })
  },

  /**
   * 关闭隐私政策弹窗
   */
  closePrivacy: function () {
    this.setData({
      showPrivacyModal: false
    })
  },

  /**
   * 返回上一页或跳转到首页
   */
  navigateBack: function () {
    const pages = getCurrentPages()
    
    if (pages.length > 1) {
      // 有上一页，返回上一页
      wx.navigateBack()
    } else {
      // 没有上一页，跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  }
})