import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    console.log(`🚀 API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API响应: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ 响应错误:', error);
    
    // 处理不同类型的错误
    if (error.response) {
      // 服务器响应了错误状态码
      const { status, data } = error.response;
      console.error(`HTTP ${status}:`, data);
      
      // 根据状态码显示不同的错误信息
      switch (status) {
        case 400:
          console.error('请求参数错误');
          break;
        case 401:
          console.error('未授权访问');
          break;
        case 403:
          console.error('禁止访问');
          break;
        case 404:
          console.error('资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error('未知错误');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络连接失败，请检查网络或服务器状态');
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API方法封装
export const api = {
  // 系统监控
  getHealth: () => apiClient.get('/monitor/health'),
  getStats: () => apiClient.get('/monitor/stats'),
  getLogs: (params) => apiClient.get('/monitor/logs', { params }),

  // Google Colab训练
  launchColabTraining: (data) => apiClient.post('/training/colab/launch', data),
  getTrainingStatus: (sessionId) => apiClient.get(`/training/colab/status/${sessionId}`),
  submitTrainingResult: (data) => apiClient.post('/training/colab/result', data),
  getColabTemplates: () => apiClient.get('/training/colab/templates'),
  configureTraining: (data) => apiClient.post('/training/colab/config', data),
  stopTraining: (sessionId) => apiClient.post(`/training/colab/stop/${sessionId}`),

  // 数据集管理
  getDatasets: () => apiClient.get('/datasets'),
  uploadDataset: (data) => apiClient.post('/datasets/upload', data),
  syncRoboflowData: (data) => apiClient.post('/datasets/sync', data),
  analyzeDataset: (datasetId) => apiClient.get(`/datasets/analyze/${datasetId}`),

  // 模型管理
  getModelVersions: () => apiClient.get('/models/versions'),
  deployModel: (data) => apiClient.post('/training/deploy', data),
  compareModels: (params) => apiClient.get('/models/compare', { params }),
};

// 导出axios实例供其他组件使用
export { apiClient };
export default api;
