// pages/register/register.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    errorMessage: '',
    agreeTerms: false,
    formErrors: {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果已经登录，跳转到聊天页面
    if (app.globalData.isLoggedIn) {
      wx.switchTab({
        url: '/pages/chat/chat'
      })
    }
    
    // 如果有传递的邮箱参数，填充到表单
    if (options.email) {
      this.setData({
        email: decodeURIComponent(options.email)
      })
    }
  },

  /**
   * 输入框内容变化处理
   */
  onInputChange: function (e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value,
      errorMessage: '',
      [`formErrors.${field}`]: '' // 清除对应字段的错误信息
    })
  },

  /**
   * 切换密码显示/隐藏
   */
  togglePasswordVisibility: function (e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: !this.data[field]
    })
  },

  /**
   * 切换同意条款选项
   */
  toggleAgreeTerms: function () {
    this.setData({
      agreeTerms: !this.data.agreeTerms
    })
  },

  /**
   * 表单提交前验证
   */
  validateForm: function () {
    const { email, password, confirmPassword, nickname, agreeTerms } = this.data
    let isValid = true
    const formErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: ''
    }
    
    // 验证邮箱
    if (!email) {
      formErrors.email = '请输入邮箱'
      isValid = false
    } else {
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        formErrors.email = '请输入有效的邮箱地址'
        isValid = false
      }
    }
    
    // 验证昵称
    if (!nickname) {
      formErrors.nickname = '请输入昵称'
      isValid = false
    } else if (nickname.length < 2 || nickname.length > 20) {
      formErrors.nickname = '昵称长度应为2-20个字符'
      isValid = false
    }
    
    // 验证密码
    if (!password) {
      formErrors.password = '请输入密码'
      isValid = false
    } else if (password.length < 6) {
      formErrors.password = '密码长度至少为6个字符'
      isValid = false
    }
    
    // 验证确认密码
    if (!confirmPassword) {
      formErrors.confirmPassword = '请确认密码'
      isValid = false
    } else if (confirmPassword !== password) {
      formErrors.confirmPassword = '两次输入的密码不一致'
      isValid = false
    }
    
    // 验证是否同意条款
    if (!agreeTerms) {
      this.setData({
        errorMessage: '请阅读并同意用户协议和隐私政策'
      })
      isValid = false
    }
    
    this.setData({ formErrors })
    return isValid
  },

  /**
   * 注册处理
   */
  handleRegister: function () {
    // 表单验证
    if (!this.validateForm()) {
      return
    }
    
    const { email, password, nickname } = this.data
    
    // 设置加载状态
    this.setData({
      isLoading: true,
      errorMessage: ''
    })
    
    // 调用注册API
    wx.request({
      url: app.globalData.apiBaseUrl + '/auth/register',
      method: 'POST',
      data: {
        email: email,
        password: password,
        nickname: nickname
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 注册成功
          const { token, userInfo } = res.data
          
          // 设置全局登录状态
          app.setLoginStatus(token, userInfo)
          
          // 显示成功提示
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000
          })
          
          // 跳转到聊天页面
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/chat/chat'
            })
          }, 2000)
        } else {
          // 注册失败
          this.setData({
            errorMessage: res.data.message || '注册失败，请稍后重试'
          })
        }
      },
      fail: (err) => {
        console.error('注册请求失败', err)
        this.setData({
          errorMessage: '网络错误，请稍后重试'
        })
      },
      complete: () => {
        this.setData({
          isLoading: false
        })
      }
    })
  },

  /**
   * 跳转到登录页面
   */
  navigateToLogin: function () {
    wx.navigateBack()
  },

  /**
   * 跳转到用户协议页面
   */
  navigateToTerms: function () {
    wx.navigateTo({
      url: '/pages/profile/about/terms'
    })
  },

  /**
   * 跳转到隐私政策页面
   */
  navigateToPrivacy: function () {
    wx.navigateTo({
      url: '/pages/profile/about/privacy'
    })
  },

  /**
   * 微信一键注册
   */
  handleWechatRegister: function () {
    this.setData({
      isLoading: true,
      errorMessage: ''
    })
    
    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        // 获取登录凭证
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              // 发送凭证到服务器换取token
              wx.request({
                url: app.globalData.apiBaseUrl + '/auth/wechat-register',
                method: 'POST',
                data: {
                  code: loginRes.code,
                  userInfo: profileRes.userInfo
                },
                success: (res) => {
                  if (res.statusCode === 200 && res.data.success) {
                    // 注册成功
                    const { token, userInfo } = res.data
                    
                    // 设置全局登录状态
                    app.setLoginStatus(token, userInfo)
                    
                    // 显示成功提示
                    wx.showToast({
                      title: '注册成功',
                      icon: 'success',
                      duration: 2000
                    })
                    
                    // 跳转到聊天页面
                    setTimeout(() => {
                      wx.switchTab({
                        url: '/pages/chat/chat'
                      })
                    }, 2000)
                  } else {
                    // 注册失败
                    this.setData({
                      errorMessage: res.data.message || '微信注册失败'
                    })
                  }
                },
                fail: (err) => {
                  console.error('微信注册请求失败', err)
                  this.setData({
                    errorMessage: '网络错误，请稍后重试'
                  })
                },
                complete: () => {
                  this.setData({
                    isLoading: false
                  })
                }
              })
            } else {
              this.setData({
                isLoading: false,
                errorMessage: '获取微信登录凭证失败'
              })
            }
          },
          fail: (err) => {
            console.error('微信登录失败', err)
            this.setData({
              isLoading: false,
              errorMessage: '微信登录失败'
            })
          }
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
        this.setData({
          isLoading: false,
          errorMessage: err.errMsg === 'getUserProfile:fail auth deny' ? 
            '您已拒绝授权获取信息' : '获取用户信息失败'
        })
      }
    })
  }
})