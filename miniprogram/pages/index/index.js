// pages/index/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    features: [
      {
        id: 1,
        title: 'AI聊天',
        desc: '与AI助手进行智能对话',
        icon: '/images/chat-icon.png',
        url: '/pages/chat/chat'
      },
      {
        id: 2,
        title: '图像生成',
        desc: 'AI生成精美图片',
        icon: '/images/image-icon.png',
        url: '/pages/ai/ai?type=image'
      },
      {
        id: 3,
        title: '代码生成',
        desc: 'AI辅助编程开发',
        icon: '/images/code-icon.png',
        url: '/pages/ai/ai?type=code'
      },
      {
        id: 4,
        title: '文本分析',
        desc: '智能文本处理工具',
        icon: '/images/text-icon.png',
        url: '/pages/ai/ai?type=text'
      }
    ],
    quickActions: [
      {
        id: 1,
        title: '快速问答',
        action: 'quickQA'
      },
      {
        id: 2,
        title: '生成图片',
        action: 'generateImage'
      },
      {
        id: 3,
        title: '代码助手',
        action: 'codeHelper'
      }
    ]
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = app.isLoggedIn();
    const userInfo = app.globalData.userInfo;
    
    this.setData({
      isLoggedIn,
      userInfo
    });
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 跳转到注册页
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },

  // 跳转到功能页面
  goToFeature(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    });
  },

  // 快速问答
  quickQA() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  // 生成图片
  generateImage() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/ai/ai?type=image'
    });
  },

  // 代码助手
  codeHelper() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/ai/ai?type=code'
    });
  },

  // 快速操作
  handleQuickAction(e) {
    const { action } = e.currentTarget.dataset;
    
    switch (action) {
      case 'quickQA':
        this.quickQA();
        break;
      case 'generateImage':
        this.generateImage();
        break;
      case 'codeHelper':
        this.codeHelper();
        break;
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        app.showError('获取用户信息失败');
      }
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'AI助手 - 智能对话，代码生成，图像创作',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'AI助手 - 你的智能伙伴',
      imageUrl: '/images/share.png'
    };
  }
}); 