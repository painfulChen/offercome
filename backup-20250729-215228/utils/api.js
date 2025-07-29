const axios = require('axios');
const logger = require('./logger');

class ApiClient {
  constructor(baseURL, timeout = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`API响应: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('API响应错误:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // GET请求
  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST请求
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT请求
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE请求
  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 文件上传
  async upload(url, file, config = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post(url, formData, {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 设置认证头
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // 移除认证头
  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // 错误处理
  handleError(error) {
    if (error.response) {
      // 服务器响应了错误状态码
      const { status, data } = error.response;
      return new Error(data?.message || `HTTP ${status} 错误`);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return new Error('网络连接失败');
    } else {
      // 其他错误
      return new Error(error.message || '未知错误');
    }
  }
}

// 创建默认API客户端
const apiClient = new ApiClient(process.env.API_BASE_URL || 'http://localhost:3000/api');

module.exports = {
  ApiClient,
  apiClient
}; 