// pages/ai/ai.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: false,
    aiTools: [
      {
        id: 'text-generation',
        name: '文本生成',
        icon: '/images/ai-text.png',
        description: '基于提示生成文章、故事、诗歌等文本内容',
        path: '/pages/ai/text/text'
      },
      {
        id: 'image-generation',
        name: '图像生成',
        icon: '/images/ai-image.png',
        description: '根据文本描述生成各种风格的图像',
        path: '/pages/ai/image/image'
      },
      {
        id: 'voice-recognition',
        name: '语音识别',
        icon: '/images/ai-voice.png',
        description: '将语音转换为文本，支持多种语言',
        path: '/pages/ai/voice/voice'
      },
      {
        id: 'translation',
        name: '智能翻译',
        icon: '/images/ai-translate.png',
        description: '在多种语言之间进行高质量翻译',
        path: '/pages/ai/translate/translate'
      },
      {
        id: 'summarization',
        name: '内容摘要',
        icon: '/images/ai-summary.png',
        description: '自动提取长文本的关键信息和要点',
        path: '/pages/ai/summary/summary'
      },
      {
        id: 'qa-system',
        name: '智能问答',
        icon: '/images/ai-qa.png',
        description: '基于知识库回答各类问题',
        path: '/pages/ai/qa/qa'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkLoginStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    const isLoggedIn = app.globalData.isLoggedIn
    this.setData({
      isLoggedIn: isLoggedIn
    })

    if (!isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录以使用AI工具',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    }
  },

  /**
   * 跳转到AI工具详情页
   */
  navigateToTool: function (e) {
    if (!this.data.isLoggedIn) {
      this.checkLoginStatus()
      return
    }

    const toolId = e.currentTarget.dataset.id
    const tool = this.data.aiTools.find(item => item.id === toolId)
    
    if (tool) {
      wx.navigateTo({
        url: tool.path,
      })
    }
  },

  /**
   * 跳转到登录页
   */
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  }
})