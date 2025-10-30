// API配置管理
const axios = require('axios');

class APIConfig {
    constructor() {
        this.config = {
            // Roboflow API配置
            roboflow: {
                apiKey: 'BwTemPbP39LHLFH4teds', // 必须是你 Roboflow 后台生成的 workspace 私钥
                workspace: 'malaysian-food-detection',
                projectId: 'malaysian-food-detection-wy3kt',
                baseUrl: 'https://api.roboflow.com',
            },
            
            // Gemini API配置
            gemini: {
                apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
            },
            
            // Google Colab配置
            colab: {
                templateBaseUrl: process.env.COLAB_TEMPLATE_BASE_URL || 'https://colab.research.google.com/drive',
                templates: {
                    yolov8_basic: process.env.COLAB_TEMPLATE_YOLOV8_BASIC || '',
                    yolov8_advanced: process.env.COLAB_TEMPLATE_YOLOV8_ADVANCED || '',
                    custom: process.env.COLAB_TEMPLATE_CUSTOM || ''
                }
            },
            
            // 自定义API配置
            custom: {
                // 您可以在这里添加您的自定义API配置
                trainingAPI: {
                    baseUrl: process.env.TRAINING_API_URL || '',
                    apiKey: process.env.TRAINING_API_KEY || ''
                },
                datasetAPI: {
                    baseUrl: process.env.DATASET_API_URL || '',
                    apiKey: process.env.DATASET_API_KEY || ''
                },
                modelAPI: {
                    baseUrl: process.env.MODEL_API_URL || '',
                    apiKey: process.env.MODEL_API_KEY || ''
                }
            }
        };
    }

    // 获取配置
    getConfig(service) {
        return this.config[service] || {};
    }

    // 更新配置
    updateConfig(service, newConfig) {
        if (this.config[service]) {
            this.config[service] = { ...this.config[service], ...newConfig };
        }
    }

    // 创建API客户端
    createAPIClient(service, customHeaders = {}) {
        const config = this.getConfig(service);
        if (!config.baseUrl) {
            throw new Error(`No base URL configured for ${service}`);
        }
        // Roboflow 不加 Authorization，只保留 Content-Type，customHeaders 留给自定义API
        const isRoboflow = service === 'roboflow';
        return axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                ...(isRoboflow ? {} : {'Authorization': config.apiKey ? `Bearer ${config.apiKey}` : undefined}),
                ...customHeaders
            },
            timeout: 30000
        });
    }

    // 测试API连接
    async testConnection(service) {
        try {
            const client = this.createAPIClient(service);
            const config = this.getConfig(service);
            
            // 根据不同的服务进行不同的测试
            switch (service) {
                case 'roboflow':
                    // 测试Roboflow API连接 - 使用根端点
                    const roboflowResponse = await client.get('/');
                    return { success: true, data: roboflowResponse.data };
                    
                case 'gemini':
                    const geminiResponse = await client.get('/models');
                    return { success: true, data: geminiResponse.data };
                    
                case 'custom':
                    // 测试自定义API
                    if (config.trainingAPI.baseUrl) {
                        const trainingResponse = await this.createAPIClient('custom', {
                            'Authorization': `Bearer ${config.trainingAPI.apiKey}`
                        }).get('/health');
                        return { success: true, data: trainingResponse.data };
                    }
                    return { success: false, error: 'No custom API configured' };
                    
                default:
                    return { success: false, error: 'Unknown service' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                details: error.response?.data || null
            };
        }
    }

    // 获取所有配置状态
    async getAllConfigStatus() {
        const status = {};
        
        for (const service of Object.keys(this.config)) {
            try {
                status[service] = await this.testConnection(service);
            } catch (error) {
                status[service] = { success: false, error: error.message };
            }
        }
        
        return status;
    }
}

module.exports = new APIConfig();
