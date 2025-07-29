// pages/profile/profile.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: null,
    // 是否已登录
    isLoggedIn: false,
    // 是否正在加载用户信息
    isLoading: true,
    // 设置项列表
    settingsList: [
      {
        id: 'account',
        title: '账号与安全',
        icon: '/images/icon-account.png',
        url: '/pages/account/account'
      },
      {
        id: 'notification',
        title: '消息通知',
        icon: '/images/icon-notification.png',
        url: '/pages/notification/notification'
      },
      {
        id: 'privacy',
        title: '隐私设置',
        icon: '/images/icon-privacy.png',
        url: '/pages/privacy/privacy'
      },
      {
        id: 'about',
        title: '关于我们',
        icon: '/images/icon-about.png',
        url: '/pages/about/about'
      },
      {
        id: 'feedback',
        title: '意见反馈',
        icon: '/images/icon-feedback.png',
        url: '/pages/feedback/feedback'
      }
    ],
    // 会员信息
    memberInfo: null,
    // 是否显示会员弹窗
    showMemberModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查登录状态
    this.checkLoginStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 如果已登录，获取最新的用户信息
    if (app.globalData.isLoggedIn) {
      this.getUserInfo()
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    const isLoggedIn = app.globalData.isLoggedIn
    
    this.setData({
      isLoggedIn,
      isLoading: isLoggedIn // 如果已登录，则显示加载状态，等待获取用户信息
    })
    
    if (isLoggedIn) {
      this.getUserInfo()
    } else {
      this.setData({
        isLoading: false
      })
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function () {
    wx.request({
      url: app.globalData.apiBaseUrl + '/user/profile',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const userInfo = res.data.userInfo
          const memberInfo = res.data.memberInfo
          
          this.setData({
            userInfo,
            memberInfo
          })
          
          // 更新全局用户信息
          app.globalData.userInfo = userInfo
        } else {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求用户信息失败', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
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
   * 跳转到登录页
   */
  navigateToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  /**
   * 跳转到设置页面
   */
  navigateToSetting: function (e) {
    const url = e.currentTarget.dataset.url
    
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: url
    })
  },

  /**
   * 编辑个人资料
   */
  editProfile: function () {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  /**
   * 显示会员弹窗
   */
  showMembershipModal: function () {
    this.setData({
      showMemberModal: true
    })
  },

  /**
   * 关闭会员弹窗
   */
  closeMembershipModal: function () {
    this.setData({
      showMemberModal: false
    })
  },

  /**
   * 跳转到会员页面
   */
  navigateToMembership: function () {
    this.setData({
      showMemberModal: false
    })
    
    wx.navigateTo({
      url: '/pages/membership/membership'
    })
  },

  /**
   * 退出登录
   */
  logout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态和token
          app.globalData.isLoggedIn = false
          app.globalData.token = ''
          app.globalData.userInfo = null
          
          // 更新页面状态
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            memberInfo: null
          })
          
          // 清除本地存储的登录信息
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})