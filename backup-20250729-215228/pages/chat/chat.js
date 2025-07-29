// pages/chat/chat.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 聊天消息列表
    messages: [],
    // 输入框内容
    inputContent: '',
    // 是否显示发送按钮
    showSendButton: false,
    // 是否正在加载历史消息
    isLoadingHistory: false,
    // 是否还有更多历史消息
    hasMoreMessages: true,
    // 当前页码
    currentPage: 1,
    // 每页消息数量
    pageSize: 20,
    // 是否正在发送消息
    isSending: false,
    // 是否显示语音输入按钮
    showVoiceButton: true,
    // 是否正在录音
    isRecording: false,
    // 录音时长
    recordingTime: 0,
    // 录音计时器
    recordTimer: null,
    // 是否显示取消录音提示
    showCancelRecordTip: false,
    // 是否显示AI思考中状态
    isAIThinking: false,
    // 是否显示底部工具栏
    showToolbar: false,
    // 是否显示表情选择器
    showEmojiPicker: false,
    // 是否显示更多功能面板
    showMorePanel: false,
    // 滚动区域高度
    scrollHeight: 0,
    // 键盘高度
    keyboardHeight: 0,
    // 底部安全区域高度
    safeAreaBottom: 0,
    // 是否自动滚动到底部
    autoScroll: true,
    // 当前会话ID
    conversationId: '',
    // 会话列表
    conversations: [],
    // 是否显示会话选择器
    showConversationSelector: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 获取系统信息设置页面高度
    this.setPageHeight()
    
    // 如果有会话ID参数，加载指定会话
    if (options.conversationId) {
      this.setData({
        conversationId: options.conversationId
      })
      this.loadConversation(options.conversationId)
    } else {
      // 否则加载会话列表，选择最近的会话或创建新会话
      this.loadConversations()
    }
    
    // 初始化WebSocket连接
    this.initWebSocket()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 如果未登录，跳转到登录页
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 如果WebSocket未连接，重新连接
    if (app.globalData.socketStatus !== 'connected') {
      this.initWebSocket()
    }
    
    // 标记为已读
    if (this.data.conversationId) {
      this.markAsRead(this.data.conversationId)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 关闭所有面板
    this.closeAllPanels()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 清除录音计时器
    if (this.data.recordTimer) {
      clearInterval(this.data.recordTimer)
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 下拉加载更多历史消息
    if (this.data.hasMoreMessages && !this.data.isLoadingHistory) {
      this.loadMoreMessages()
    } else {
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 设置页面高度
   */
  setPageHeight: function () {
    const systemInfo = wx.getSystemInfoSync()
    const safeAreaBottom = systemInfo.screenHeight - systemInfo.safeArea.bottom
    
    this.setData({
      scrollHeight: systemInfo.windowHeight - 100, // 减去输入框高度
      safeAreaBottom: safeAreaBottom
    })
  },

  /**
   * 初始化WebSocket连接
   */
  initWebSocket: function () {
    // 如果已经连接，不再重复连接
    if (app.globalData.socketStatus === 'connected') {
      return
    }
    
    // 连接WebSocket
    app.connectWebSocket((message) => {
      // 处理接收到的消息
      this.handleReceivedMessage(message)
    })
  },

  /**
   * 处理接收到的WebSocket消息
   */
  handleReceivedMessage: function (message) {
    try {
      const data = JSON.parse(message.data)
      
      // 根据消息类型处理
      switch (data.type) {
        case 'message':
          // 如果是当前会话的消息，添加到消息列表
          if (data.conversationId === this.data.conversationId) {
            this.addMessage(data.message)
            // 如果是AI消息，标记AI思考结束
            if (data.message.role === 'assistant') {
              this.setData({
                isAIThinking: false
              })
            }
          } else {
            // 如果不是当前会话，更新会话列表未读数
            this.updateConversationUnread(data.conversationId)
          }
          break
        
        case 'thinking':
          // AI开始思考
          if (data.conversationId === this.data.conversationId) {
            this.setData({
              isAIThinking: true
            })
          }
          break
        
        case 'error':
          // 显示错误消息
          wx.showToast({
            title: data.message || '发生错误',
            icon: 'none'
          })
          this.setData({
            isAIThinking: false,
            isSending: false
          })
          break
      }
    } catch (error) {
      console.error('处理WebSocket消息失败', error)
    }
  },

  /**
   * 加载会话列表
   */
  loadConversations: function () {
    wx.request({
      url: app.globalData.apiBaseUrl + '/conversations',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const conversations = res.data.conversations || []
          this.setData({ conversations })
          
          // 如果有会话，选择第一个
          if (conversations.length > 0) {
            this.setData({
              conversationId: conversations[0].id
            })
            this.loadConversation(conversations[0].id)
          } else {
            // 没有会话，创建新会话
            this.createNewConversation()
          }
        } else {
          wx.showToast({
            title: '加载会话列表失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求会话列表失败', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 创建新会话
   */
  createNewConversation: function () {
    wx.request({
      url: app.globalData.apiBaseUrl + '/conversations',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      data: {
        title: '新对话'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const newConversation = res.data.conversation
          
          // 更新会话列表
          const conversations = [newConversation, ...this.data.conversations]
          this.setData({
            conversationId: newConversation.id,
            conversations: conversations,
            messages: [] // 清空消息列表
          })
          
          // 添加欢迎消息
          this.addMessage({
            id: 'welcome',
            role: 'assistant',
            content: '你好！我是AI助手，有什么我可以帮助你的吗？',
            timestamp: new Date().toISOString()
          })
        } else {
          wx.showToast({
            title: '创建新会话失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('创建新会话请求失败', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 加载指定会话
   */
  loadConversation: function (conversationId) {
    this.setData({
      isLoadingHistory: true,
      messages: [],
      currentPage: 1
    })
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/conversations/' + conversationId,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 更新会话信息
          const conversation = res.data.conversation
          
          // 更新消息列表
          const messages = res.data.messages || []
          this.setData({
            messages: messages,
            hasMoreMessages: messages.length >= this.data.pageSize
          })
          
          // 标记为已读
          this.markAsRead(conversationId)
          
          // 滚动到底部
          this.scrollToBottom()
        } else {
          wx.showToast({
            title: '加载会话失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求会话详情失败', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          isLoadingHistory: false
        })
        wx.stopPullDownRefresh()
      }
    })
  },

  /**
   * 加载更多历史消息
   */
  loadMoreMessages: function () {
    if (this.data.isLoadingHistory || !this.data.hasMoreMessages) {
      return
    }
    
    this.setData({
      isLoadingHistory: true
    })
    
    const nextPage = this.data.currentPage + 1
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/conversations/' + this.data.conversationId + '/messages',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      data: {
        page: nextPage,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const newMessages = res.data.messages || []
          
          // 更新消息列表，将新消息添加到列表前面
          this.setData({
            messages: [...newMessages, ...this.data.messages],
            currentPage: nextPage,
            hasMoreMessages: newMessages.length >= this.data.pageSize
          })
        } else {
          wx.showToast({
            title: '加载历史消息失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求历史消息失败', err)
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          isLoadingHistory: false
        })
        wx.stopPullDownRefresh()
      }
    })
  },

  /**
   * 标记会话为已读
   */
  markAsRead: function (conversationId) {
    wx.request({
      url: app.globalData.apiBaseUrl + '/conversations/' + conversationId + '/read',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 更新会话列表中的未读数
          const conversations = this.data.conversations.map(conv => {
            if (conv.id === conversationId) {
              return { ...conv, unreadCount: 0 }
            }
            return conv
          })
          this.setData({ conversations })
        }
      },
      fail: (err) => {
        console.error('标记已读失败', err)
      }
    })
  },

  /**
   * 更新会话未读数
   */
  updateConversationUnread: function (conversationId) {
    const conversations = this.data.conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
      }
      return conv
    })
    this.setData({ conversations })
  },

  /**
   * 添加消息到列表
   */
  addMessage: function (message) {
    const messages = [...this.data.messages, message]
    this.setData({ messages })
    
    // 滚动到底部
    if (this.data.autoScroll) {
      this.scrollToBottom()
    }
  },

  /**
   * 滚动到底部
   */
  scrollToBottom: function () {
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('#message-list')
        .boundingClientRect(rect => {
          if (rect && rect.height > 0) {
            wx.pageScrollTo({
              scrollTop: rect.height,
              duration: 300
            })