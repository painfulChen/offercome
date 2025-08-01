// 内存存储工具 - 当数据库不可用时的备选方案
class MemoryStorage {
  constructor() {
    this.storage = new Map();
    this.counter = 0;
  }

  // 生成唯一ID
  generateId() {
    this.counter++;
    return `mbti_mem_${Date.now()}_${this.counter}`;
  }

  // 保存MBTI结果
  async saveMbtiResult(data) {
    const id = this.generateId();
    const result = {
      id,
      testId: data.testId || id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.storage.set(id, result);
    console.log(`💾 内存存储: 保存测试结果 ${id}`);
    return result;
  }

  // 根据邮箱查询历史
  async findByEmail(email) {
    const results = [];
    for (const [id, result] of this.storage) {
      if (result.userInfo && result.userInfo.email === email) {
        results.push(result);
      }
    }
    
    // 按创建时间排序
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  }

  // 获取MBTI类型分布
  async getMbtiDistribution() {
    const distribution = new Map();
    
    for (const [id, result] of this.storage) {
      const mbtiType = result.mbtiType;
      distribution.set(mbtiType, (distribution.get(mbtiType) || 0) + 1);
    }
    
    return Array.from(distribution.entries()).map(([mbtiType, count]) => ({
      _id: mbtiType,
      count
    })).sort((a, b) => b.count - a.count);
  }

  // 获取专业分布
  async getMajorDistribution() {
    const distribution = new Map();
    
    for (const [id, result] of this.storage) {
      if (result.userInfo && result.userInfo.major) {
        const major = result.userInfo.major;
        distribution.set(major, (distribution.get(major) || 0) + 1);
      }
    }
    
    return Array.from(distribution.entries()).map(([major, count]) => ({
      _id: major,
      count
    })).sort((a, b) => b.count - a.count);
  }

  // 获取总数
  async countDocuments() {
    return this.storage.size;
  }

  // 获取摘要信息
  getSummary(result) {
    return {
      testId: result.testId,
      mbtiType: result.mbtiType,
      major: result.userInfo?.major,
      school: result.userInfo?.school,
      completedAt: result.createdAt,
      suitableIndustries: result.careerAdvice?.suitable?.map(s => s.industry) || [],
      strengthsCount: result.strengths?.length || 0,
      improvementsCount: result.improvements?.length || 0
    };
  }

  // 清空存储
  clear() {
    this.storage.clear();
    this.counter = 0;
    console.log('🗑️  内存存储已清空');
  }

  // 获取存储统计
  getStats() {
    return {
      totalRecords: this.storage.size,
      counter: this.counter,
      memoryUsage: process.memoryUsage()
    };
  }
}

// 创建全局实例
const memoryStorage = new MemoryStorage();

module.exports = memoryStorage; 