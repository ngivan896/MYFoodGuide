const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 导入真实数据服务
const realDataService = require('./services/real-data-service');
const apiConfig = require('./config/api-config');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// 数据存储 (临时使用JSON文件，生产环境建议使用数据库)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化数据文件
const initDataFile = (filename, defaultData = {}) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
    return filePath;
};

// 数据文件路径
const trainingSessionsFile = initDataFile('training_sessions.json', {});
const datasetsFile = initDataFile('datasets.json', {});
const modelsFile = initDataFile('models.json', {});
const systemStatsFile = initDataFile('system_stats.json', {
    api_calls: 0,
    errors: 0,
    uptime: Date.now()
});

// 工具函数
const readJsonFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return {};
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// ==================== Google Colab 集成 API ====================

// 1. 启动Colab训练
app.post('/api/training/colab/launch', (req, res) => {
    try {
        const { dataset_id, model_config, training_params } = req.body;
        
        // 生成训练会话ID
        const sessionId = uuidv4();
        const timestamp = new Date().toISOString();
        
        // 创建训练会话记录
        const trainingSessions = readJsonFile(trainingSessionsFile);
        trainingSessions[sessionId] = {
            id: sessionId,
            status: 'initializing',
            dataset_id,
            model_config,
            training_params,
            created_at: timestamp,
            updated_at: timestamp,
            colab_url: null,
            progress: 0,
            logs: []
        };
        
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        // 生成Colab URL (这里需要实际的Colab模板URL)
        const colabUrl = `https://colab.research.google.com/drive/your-template-id?session_id=${sessionId}`;
        
        // 更新会话状态
        trainingSessions[sessionId].colab_url = colabUrl;
        trainingSessions[sessionId].status = 'ready';
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        res.json({
            success: true,
            session_id: sessionId,
            colab_url: colabUrl,
            message: 'Colab训练会话已创建'
        });
        
    } catch (error) {
        console.error('Error launching Colab training:', error);
        res.status(500).json({
            success: false,
            error: '启动Colab训练失败'
        });
    }
});

// 2. 获取训练状态
app.get('/api/training/colab/status/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const trainingSessions = readJsonFile(trainingSessionsFile);
        
        if (!trainingSessions[sessionId]) {
            return res.status(404).json({
                success: false,
                error: '训练会话不存在'
            });
        }
        
        res.json({
            success: true,
            session: trainingSessions[sessionId]
        });
        
    } catch (error) {
        console.error('Error getting training status:', error);
        res.status(500).json({
            success: false,
            error: '获取训练状态失败'
        });
    }
});

// 3. 接收训练结果
app.post('/api/training/colab/result', (req, res) => {
    try {
        const { session_id, status, progress, logs, model_path, metrics } = req.body;
        
        const trainingSessions = readJsonFile(trainingSessionsFile);
        
        if (!trainingSessions[session_id]) {
            return res.status(404).json({
                success: false,
                error: '训练会话不存在'
            });
        }
        
        // 更新训练会话
        trainingSessions[session_id].status = status;
        trainingSessions[session_id].progress = progress || 0;
        trainingSessions[session_id].updated_at = new Date().toISOString();
        
        if (logs) {
            trainingSessions[session_id].logs.push(...logs);
        }
        
        if (model_path) {
            trainingSessions[session_id].model_path = model_path;
        }
        
        if (metrics) {
            trainingSessions[session_id].metrics = metrics;
        }
        
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        res.json({
            success: true,
            message: '训练结果已更新'
        });
        
    } catch (error) {
        console.error('Error receiving training result:', error);
        res.status(500).json({
            success: false,
            error: '接收训练结果失败'
        });
    }
});

// 4. 获取Colab模板列表
app.get('/api/training/colab/templates', (req, res) => {
    try {
        const templates = [
            {
                id: 'yolov8_basic',
                name: 'YOLOv8 基础训练',
                description: '适用于马来西亚食物识别的YOLOv8基础训练模板',
                url: 'https://colab.research.google.com/drive/yolov8-basic-template',
                file_path: '/colab_templates/quick_start_template.py',
                parameters: ['epochs', 'batch_size', 'learning_rate', 'img_size'],
                model_type: 'yolov8n',
                default_config: {
                    epochs: 50,
                    batch_size: 16,
                    learning_rate: 0.01,
                    img_size: 640
                }
            },
            {
                id: 'yolov8_advanced',
                name: 'YOLOv8 高级训练',
                description: '包含数据增强和超参数优化的高级训练模板',
                url: 'https://colab.research.google.com/drive/yolov8-advanced-template',
                file_path: '/colab_templates/yolov8_malaysian_food_training.ipynb',
                parameters: ['epochs', 'batch_size', 'learning_rate', 'img_size', 'augment', 'optimizer'],
                model_type: 'yolov8s',
                default_config: {
                    epochs: 100,
                    batch_size: 8,
                    learning_rate: 0.005,
                    img_size: 640,
                    augment: true,
                    optimizer: 'AdamW'
                }
            },
            {
                id: 'custom_training',
                name: '自定义训练',
                description: '完全自定义的训练配置模板',
                url: 'https://colab.research.google.com/drive/custom-training-template',
                file_path: '/colab_templates/custom_training_template.py',
                parameters: ['model_type', 'epochs', 'batch_size', 'learning_rate', 'img_size', 'augment', 'optimizer', 'loss_function'],
                model_type: 'yolov8m',
                default_config: {
                    epochs: 150,
                    batch_size: 12,
                    learning_rate: 0.003,
                    img_size: 640,
                    augment: true,
                    optimizer: 'AdamW',
                    loss_function: 'BCE'
                }
            }
        ];
        
        res.json({
            success: true,
            templates
        });
        
    } catch (error) {
        console.error('Error getting Colab templates:', error);
        res.status(500).json({
            success: false,
            error: '获取Colab模板失败'
        });
    }
});

// 4.1. 下载Colab模板文件
app.get('/api/training/colab/templates/:templateId/download', (req, res) => {
    try {
        const { templateId } = req.params;
        const templatePath = path.join(__dirname, 'colab_templates');
        
        let fileName;
        switch (templateId) {
            case 'yolov8_basic':
                fileName = 'quick_start_template.py';
                break;
            case 'yolov8_advanced':
                fileName = 'yolov8_malaysian_food_training.ipynb';
                break;
            case 'custom_training':
                fileName = 'custom_training_template.py';
                break;
            default:
                return res.status(404).json({
                    success: false,
                    error: '模板不存在'
                });
        }
        
        const filePath = path.join(templatePath, fileName);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: '模板文件不存在'
            });
        }
        
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error downloading template:', err);
                res.status(500).json({
                    success: false,
                    error: '下载模板失败'
                });
            }
        });
        
    } catch (error) {
        console.error('Error downloading template:', error);
        res.status(500).json({
            success: false,
            error: '下载模板失败'
        });
    }
});

// 5. 配置训练参数
app.post('/api/training/colab/config', (req, res) => {
    try {
        const { session_id, config } = req.body;
        
        const trainingSessions = readJsonFile(trainingSessionsFile);
        
        if (!trainingSessions[session_id]) {
            return res.status(404).json({
                success: false,
                error: '训练会话不存在'
            });
        }
        
        // 更新训练配置
        trainingSessions[session_id].training_config = config;
        trainingSessions[session_id].updated_at = new Date().toISOString();
        
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        res.json({
            success: true,
            message: '训练配置已更新'
        });
        
    } catch (error) {
        console.error('Error configuring training:', error);
        res.status(500).json({
            success: false,
            error: '配置训练参数失败'
        });
    }
});

// 6. 停止训练
app.post('/api/training/colab/stop/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const trainingSessions = readJsonFile(trainingSessionsFile);
        
        if (!trainingSessions[sessionId]) {
            return res.status(404).json({
                success: false,
                error: '训练会话不存在'
            });
        }
        
        // 更新状态为停止
        trainingSessions[sessionId].status = 'stopped';
        trainingSessions[sessionId].updated_at = new Date().toISOString();
        
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        res.json({
            success: true,
            message: '训练已停止'
        });
        
    } catch (error) {
        console.error('Error stopping training:', error);
        res.status(500).json({
            success: false,
            error: '停止训练失败'
        });
    }
});

// ==================== 数据集管理 API ====================

// 获取数据集列表
app.get('/api/datasets', async (req, res) => {
    try {
        const datasets = await realDataService.getDatasets();
        res.json({
            success: true,
            datasets: datasets.datasets || datasets
        });
    } catch (error) {
        console.error('Error getting datasets:', error);
        res.status(500).json({
            success: false,
            error: '获取数据集列表失败'
        });
    }
});

// 上传数据集
app.post('/api/datasets/upload', (req, res) => {
    try {
        const { name, description, type, source } = req.body;
        const datasetId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const datasets = readJsonFile(datasetsFile);
        datasets[datasetId] = {
            id: datasetId,
            name,
            description,
            type,
            source,
            status: 'uploading',
            created_at: timestamp,
            updated_at: timestamp,
            file_count: 0,
            total_size: 0
        };
        
        writeJsonFile(datasetsFile, datasets);
        
        res.json({
            success: true,
            dataset_id: datasetId,
            message: '数据集上传已开始'
        });
        
    } catch (error) {
        console.error('Error uploading dataset:', error);
        res.status(500).json({
            success: false,
            error: '上传数据集失败'
        });
    }
});

// 同步Roboflow数据
app.post('/api/datasets/sync', (req, res) => {
    try {
        const { roboflow_project_id, dataset_name } = req.body;
        
        // 这里应该实现实际的Roboflow API调用
        // 暂时返回模拟响应
        res.json({
            success: true,
            message: 'Roboflow数据同步已开始',
            sync_id: uuidv4()
        });
        
    } catch (error) {
        console.error('Error syncing Roboflow data:', error);
        res.status(500).json({
            success: false,
            error: '同步Roboflow数据失败'
        });
    }
});

// 数据集分析
app.get('/api/datasets/analyze/:datasetId', (req, res) => {
    try {
        const { datasetId } = req.params;
        const datasets = readJsonFile(datasetsFile);
        
        if (!datasets[datasetId]) {
            return res.status(404).json({
                success: false,
                error: '数据集不存在'
            });
        }
        
        // 模拟分析结果
        const analysis = {
            total_images: 1000,
            classes: 20,
            class_distribution: {
                'nasi_lemak': 50,
                'roti_canai': 45,
                'char_kway_teow': 40,
                // ... 其他类别
            },
            image_quality: {
                high: 800,
                medium: 150,
                low: 50
            },
            average_size: '1024x768',
            format_distribution: {
                'jpg': 70,
                'png': 25,
                'webp': 5
            }
        };
        
        res.json({
            success: true,
            analysis
        });
        
    } catch (error) {
        console.error('Error analyzing dataset:', error);
        res.status(500).json({
            success: false,
            error: '分析数据集失败'
        });
    }
});

// ==================== 模型管理 API ====================

// 获取模型版本
app.get('/api/models/versions', async (req, res) => {
    try {
        const models = await realDataService.getModels();
        res.json({
            success: true,
            models: models.models || models
        });
    } catch (error) {
        console.error('Error getting model versions:', error);
        res.status(500).json({
            success: false,
            error: '获取模型版本失败'
        });
    }
});

// 部署模型
app.post('/api/training/deploy', (req, res) => {
    try {
        const { model_id, deployment_type, target_platform } = req.body;
        
        // 模拟部署过程
        const deploymentId = uuidv4();
        
        res.json({
            success: true,
            deployment_id: deploymentId,
            message: '模型部署已开始',
            status: 'deploying'
        });
        
    } catch (error) {
        console.error('Error deploying model:', error);
        res.status(500).json({
            success: false,
            error: '部署模型失败'
        });
    }
});

// 模型性能对比
app.get('/api/models/compare', (req, res) => {
    try {
        const { model_ids } = req.query;
        
        // 模拟性能对比数据
        const comparison = {
            models: [
                {
                    id: 'model_v1',
                    name: 'YOLOv8n',
                    accuracy: 0.85,
                    inference_time: 15,
                    model_size: 6.2
                },
                {
                    id: 'model_v2',
                    name: 'YOLOv8s',
                    accuracy: 0.89,
                    inference_time: 22,
                    model_size: 21.5
                }
            ],
            metrics: ['accuracy', 'inference_time', 'model_size']
        };
        
        res.json({
            success: true,
            comparison
        });
        
    } catch (error) {
        console.error('Error comparing models:', error);
        res.status(500).json({
            success: false,
            error: '模型对比失败'
        });
    }
});

// ==================== 系统监控 API ====================

// API统计
app.get('/api/monitor/stats', async (req, res) => {
    try {
        const stats = await realDataService.getSystemStats();
        const uptime = Date.now() - stats.uptime;
        
        res.json({
            success: true,
            stats: {
                ...stats,
                uptime: Math.floor(uptime / 1000), // 秒
                api_calls: (stats.api_calls || 0) + 1
            }
        });
        
    } catch (error) {
        console.error('Error getting system stats:', error);
        res.status(500).json({
            success: false,
            error: '获取系统统计失败'
        });
    }
});

// 健康检查
app.get('/api/monitor/health', (req, res) => {
    try {
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    } catch (error) {
        console.error('Error in health check:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: '健康检查失败'
        });
    }
});

// 错误日志
app.get('/api/monitor/logs', (req, res) => {
    try {
        const { level, limit = 100 } = req.query;
        
        // 模拟日志数据
        const logs = [
            {
                id: uuidv4(),
                level: 'info',
                message: 'Training session started',
                timestamp: new Date().toISOString(),
                source: 'colab_integration'
            },
            {
                id: uuidv4(),
                level: 'warning',
                message: 'Dataset sync delayed',
                timestamp: new Date().toISOString(),
                source: 'roboflow_sync'
            }
        ];
        
        res.json({
            success: true,
            logs: logs.slice(0, parseInt(limit))
        });
        
    } catch (error) {
        console.error('Error getting logs:', error);
        res.status(500).json({
            success: false,
            error: '获取日志失败'
        });
    }
});

// ==================== API配置管理 ====================

// 获取API配置状态
app.get('/api/config/status', async (req, res) => {
    try {
        const status = await apiConfig.getAllConfigStatus();
        res.json({
            success: true,
            config_status: status
        });
    } catch (error) {
        console.error('Error getting config status:', error);
        res.status(500).json({
            success: false,
            error: '获取配置状态失败'
        });
    }
});

// 更新API配置
app.post('/api/config/update', (req, res) => {
    try {
        const { service, config } = req.body;
        
        if (!service || !config) {
            return res.status(400).json({
                success: false,
                error: '缺少服务名称或配置数据'
            });
        }
        
        apiConfig.updateConfig(service, config);
        
        res.json({
            success: true,
            message: `${service} 配置已更新`
        });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({
            success: false,
            error: '更新配置失败'
        });
    }
});

// 测试API连接
app.post('/api/config/test', async (req, res) => {
    try {
        const { service } = req.body;
        
        if (!service) {
            return res.status(400).json({
                success: false,
                error: '缺少服务名称'
            });
        }
        
        const result = await apiConfig.testConnection(service);
        res.json(result);
    } catch (error) {
        console.error('Error testing connection:', error);
        res.status(500).json({
            success: false,
            error: '测试连接失败'
        });
    }
});

// ==================== 前端路由 ====================

// 提供HTML界面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 如果请求的是前端路由，返回API信息
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({
            success: false,
            error: 'API endpoint not found',
            available_endpoints: [
                '/api/monitor/health',
                '/api/monitor/stats',
                '/api/training/colab/templates',
                '/api/datasets',
                '/api/models/versions'
            ]
        });
    } else {
        res.json({
            message: 'NutriScan Backend Dashboard',
            note: 'Frontend not built yet. Use API endpoints directly.',
            api_base: '/api'
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 NutriScan Backend Dashboard 服务器运行在端口 ${PORT}`);
    console.log(`📊 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 API文档: http://localhost:${PORT}/api`);
});

module.exports = app;
