const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 导入真实数据服务
const realDataService = require('./services/real-data-service');
const apiConfig = require('./config/api-config');

// 导入模板生成器
const ColabTemplateGenerator = require('./services/colab-template-generator');
const templateGenerator = new ColabTemplateGenerator();

// 导入训练自动化服务
const trainingAutomation = require('./services/training-automation-service');

// 导入营养分析服务
const nutritionAnalysis = require('./services/nutrition-analysis-service');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// API调用计数器 - 初始化为0，稍后从文件加载
let apiCallCounter = 0;

// API调用跟踪中间件
app.use('/api', (req, res, next) => {
    apiCallCounter++;
    console.log(`📊 API调用 #${apiCallCounter}: ${req.method} ${req.path}`);
    
    // 保存到文件
    const stats = readJsonFile(systemStatsFile);
    stats.api_calls = apiCallCounter;
    writeJsonFile(systemStatsFile, stats);
    
    next();
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

// ==================== Google Colab 智能集成 API ====================

// 1. 启动Colab训练 - 真正的智能集成
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
            dataset_id: dataset_id || 'default_dataset',
            model_config: model_config || {
                model_type: 'yolov8n',
                epochs: 100,
                batch_size: 16,
                learning_rate: 0.01,
                img_size: 640
            },
            training_params: training_params || {},
            created_at: timestamp,
            updated_at: timestamp,
            colab_url: null,
            progress: 0,
            logs: [],
            metrics: {},
            nutrition_analysis: {}
        };
        
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        // 生成包含用户配置的Colab模板
        const trainingConfig = {
            session_id: sessionId,
            dashboard_url: `http://localhost:${PORT}`,
            ...trainingSessions[sessionId].model_config
        };
        
        const colabTemplate = templateGenerator.generateTemplate(trainingConfig);
        
        // 保存模板文件
        const templatePath = path.join(__dirname, 'temp', `colab_template_${sessionId}.ipynb`);
        fs.writeFileSync(templatePath, colabTemplate);
        
        // 生成Colab URL - 使用Colab直接创建新笔记本的方式
        const colabUrl = `https://colab.research.google.com/create=true&templateId=${sessionId}`;
        
        // 更新会话状态
        trainingSessions[sessionId].colab_url = colabUrl;
        trainingSessions[sessionId].status = 'ready';
        trainingSessions[sessionId].template_path = templatePath;
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        console.log(`🚀 Colab训练会话已创建: ${sessionId}`);
        
        res.json({
            success: true,
            session_id: sessionId,
            colab_url: colabUrl,
            template_download_url: `/api/training/colab/template/${sessionId}/download`,
            message: 'Colab训练会话已创建，正在自动打开...'
        });
        
    } catch (error) {
        console.error('Error launching Colab training:', error);
        res.status(500).json({
            success: false,
            error: '启动Colab训练失败'
        });
    }
});

// 2. 接收Colab训练状态更新 - 实时同步
app.post('/api/training/colab/status/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status, timestamp, ...additionalData } = req.body;
        
        const trainingSessions = readJsonFile(trainingSessionsFile);
        
        if (trainingSessions[sessionId]) {
            trainingSessions[sessionId].status = status;
            trainingSessions[sessionId].updated_at = timestamp || new Date().toISOString();
            trainingSessions[sessionId].logs.push({
                timestamp: timestamp || new Date().toISOString(),
                status: status,
                data: additionalData
            });
            
            // 保存特定数据
            if (additionalData.dataset_stats) {
                trainingSessions[sessionId].dataset_stats = additionalData.dataset_stats;
            }
            if (additionalData.metrics) {
                trainingSessions[sessionId].metrics = additionalData.metrics;
            }
            if (additionalData.nutrition_results) {
                trainingSessions[sessionId].nutrition_analysis = additionalData.nutrition_results;
            }
            if (additionalData.exported_models) {
                trainingSessions[sessionId].exported_models = additionalData.exported_models;
            }
            
            writeJsonFile(trainingSessionsFile, trainingSessions);
            
            console.log(`📊 训练状态更新: ${sessionId} - ${status}`);
            
            res.json({
                success: true,
                message: '状态更新成功'
            });
        } else {
            res.status(404).json({
                success: false,
                error: '训练会话不存在'
            });
        }
    } catch (error) {
        console.error('Error updating training status:', error);
        res.status(500).json({
            success: false,
            error: '状态更新失败'
        });
    }
});

// 3. 获取训练状态
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

// 3. 接收训练结果 - 完整结果同步
app.post('/api/training/colab/result', (req, res) => {
    try {
        const { session_id, status, summary, timestamp } = req.body;
        
        const trainingSessions = readJsonFile(trainingSessionsFile);
        
        if (!trainingSessions[session_id]) {
            return res.status(404).json({
                success: false,
                error: '训练会话不存在'
            });
        }
        
        // 更新训练会话
        trainingSessions[session_id].status = status || 'completed';
        trainingSessions[session_id].summary = summary;
        trainingSessions[session_id].completed_at = timestamp || new Date().toISOString();
        trainingSessions[session_id].updated_at = timestamp || new Date().toISOString();
        
        // 保存详细结果
        if (summary) {
            trainingSessions[session_id].dataset_stats = summary.dataset_info;
            trainingSessions[session_id].metrics = summary.model_results?.metrics;
            trainingSessions[session_id].nutrition_analysis = summary.nutrition_analysis;
            trainingSessions[session_id].exported_models = summary.model_results?.exported_models;
            trainingSessions[session_id].best_model_path = summary.model_results?.best_model_path;
        }
        
        writeJsonFile(trainingSessionsFile, trainingSessions);
        
        console.log(`✅ 训练结果已保存: ${session_id}`);
        
        res.json({
            success: true,
            message: '训练结果已保存'
        });
        
    } catch (error) {
        console.error('Error receiving training result:', error);
        res.status(500).json({
            success: false,
            error: '接收训练结果失败'
        });
    }
});

// 4. 下载动态生成的Colab模板
app.get('/api/training/colab/template/:sessionId/download', (req, res) => {
    try {
        const { sessionId } = req.params;
        const trainingSessions = readJsonFile(trainingSessionsFile);
        
        if (trainingSessions[sessionId] && trainingSessions[sessionId].template_path) {
            const templatePath = trainingSessions[sessionId].template_path;
            
            if (fs.existsSync(templatePath)) {
                res.download(templatePath, `nutriscan_training_${sessionId}.ipynb`, (err) => {
                    if (err) {
                        console.error('Download error:', err);
                    } else {
                        // 下载后清理临时文件
                        setTimeout(() => {
                            if (fs.existsSync(templatePath)) {
                                fs.unlinkSync(templatePath);
                            }
                        }, 5000);
                    }
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: '模板文件不存在'
                });
            }
        } else {
            res.status(404).json({
                success: false,
                error: '训练会话不存在'
            });
        }
    } catch (error) {
        console.error('Error downloading template:', error);
        res.status(500).json({
            success: false,
            error: '下载模板失败'
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
        // 如果请求参数包含 refresh=true，清除缓存
        if (req.query.refresh === 'true') {
            realDataService.cache.delete('datasets');
            console.log('🔄 已清除数据集缓存');
        }
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

// ==================== 模型版本管理 API ====================

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
app.get('/api/models/compare', async (req, res) => {
    try {
        const { model_ids } = req.query;
        
        // 获取所有模型进行对比
        const models = await realDataService.getModels();
        
        // 如果指定了特定模型ID，只对比这些模型
        let modelsToCompare = models;
        if (model_ids) {
            const ids = model_ids.split(',');
            modelsToCompare = models.filter(model => ids.includes(model.id));
        }
        
        // 生成对比数据
        const comparison = {
            models: modelsToCompare.map(model => ({
                id: model.id,
                name: model.name,
                version: model.version,
                accuracy: model.accuracy || 0.85,
                inference_time: model.inference_time || 15,
                model_size: model.file_size || 6.2,
                classes: model.classes || 20,
                status: model.status,
                created_at: model.created_at
            })),
            metrics: ['accuracy', 'inference_time', 'model_size', 'classes'],
            summary: {
                best_accuracy: Math.max(...modelsToCompare.map(m => m.accuracy || 0.85)),
                fastest_inference: Math.min(...modelsToCompare.map(m => m.inference_time || 15)),
                smallest_size: Math.min(...modelsToCompare.map(m => m.file_size || 6.2))
            }
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

// 模型版本管理
app.post('/api/models/version', (req, res) => {
    try {
        const { model_id, version_name, description, performance_data } = req.body;
        
        const models = readJsonFile(modelsFile);
        const versionId = uuidv4();
        const timestamp = new Date().toISOString();
        
        if (!models[model_id]) {
            return res.status(404).json({
                success: false,
                error: '模型不存在'
            });
        }
        
        // 创建新版本
        const newVersion = {
            id: versionId,
            model_id: model_id,
            version_name: version_name || `v${Object.keys(models[model_id].versions || {}).length + 1}`,
            description: description || '',
            performance_data: performance_data || {},
            created_at: timestamp,
            status: 'active'
        };
        
        // 更新模型版本
        if (!models[model_id].versions) {
            models[model_id].versions = {};
        }
        models[model_id].versions[versionId] = newVersion;
        models[model_id].updated_at = timestamp;
        
        writeJsonFile(modelsFile, models);
        
        res.json({
            success: true,
            version: newVersion,
            message: '模型版本创建成功'
        });
        
    } catch (error) {
        console.error('Error creating model version:', error);
        res.status(500).json({
            success: false,
            error: '创建模型版本失败'
        });
    }
});

// 获取模型版本历史
app.get('/api/models/:modelId/versions', (req, res) => {
    try {
        const { modelId } = req.params;
        const models = readJsonFile(modelsFile);
        
        if (!models[modelId]) {
            return res.status(404).json({
                success: false,
                error: '模型不存在'
            });
        }
        
        const versions = models[modelId].versions || {};
        
        res.json({
            success: true,
            versions: Object.values(versions).sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            )
        });
        
    } catch (error) {
        console.error('Error getting model versions:', error);
        res.status(500).json({
            success: false,
            error: '获取模型版本失败'
        });
    }
});

// 模型回滚
app.post('/api/models/:modelId/rollback', (req, res) => {
    try {
        const { modelId } = req.params;
        const { version_id } = req.body;
        
        const models = readJsonFile(modelsFile);
        
        if (!models[modelId] || !models[modelId].versions || !models[modelId].versions[version_id]) {
            return res.status(404).json({
                success: false,
                error: '模型或版本不存在'
            });
        }
        
        // 将所有版本设为非活跃状态
        Object.keys(models[modelId].versions).forEach(vid => {
            models[modelId].versions[vid].status = 'inactive';
        });
        
        // 激活指定版本
        models[modelId].versions[version_id].status = 'active';
        models[modelId].versions[version_id].rollback_at = new Date().toISOString();
        
        writeJsonFile(modelsFile, models);
        
        res.json({
            success: true,
            message: '模型回滚成功',
            active_version: models[modelId].versions[version_id]
        });
        
    } catch (error) {
        console.error('Error rolling back model:', error);
        res.status(500).json({
            success: false,
            error: '模型回滚失败'
        });
    }
});

// ==================== 训练流程自动化 API ====================

// 数据预处理
app.post('/api/training/preprocess', async (req, res) => {
    try {
        const { dataset_config } = req.body;
        
        if (!dataset_config) {
            return res.status(400).json({
                success: false,
                error: '缺少数据集配置'
            });
        }
        
        const result = await trainingAutomation.preprocessDataset(dataset_config);
        
        res.json({
            success: true,
            preprocessing_id: result.id,
            status: result.status,
            message: '数据预处理已开始'
        });
        
    } catch (error) {
        console.error('Error preprocessing dataset:', error);
        res.status(500).json({
            success: false,
            error: '数据预处理失败'
        });
    }
});

// 获取预处理状态
app.get('/api/training/preprocess/:preprocessingId', async (req, res) => {
    try {
        const { preprocessingId } = req.params;
        const results = await trainingAutomation.getPreprocessingResults();
        
        if (!results[preprocessingId]) {
            return res.status(404).json({
                success: false,
                error: '预处理任务不存在'
            });
        }
        
        res.json({
            success: true,
            result: results[preprocessingId]
        });
        
    } catch (error) {
        console.error('Error getting preprocessing status:', error);
        res.status(500).json({
            success: false,
            error: '获取预处理状态失败'
        });
    }
});

// 模型部署
app.post('/api/training/deploy', async (req, res) => {
    try {
        const { model_id, deployment_type, target_platform, target_format } = req.body;
        
        if (!model_id) {
            return res.status(400).json({
                success: false,
                error: '缺少模型ID'
            });
        }
        
        const deploymentConfig = {
            model_id,
            deployment_type: deployment_type || 'production',
            target_platform: target_platform || 'mobile',
            target_format: target_format || 'tflite'
        };
        
        const result = await trainingAutomation.deployModel(deploymentConfig);
        
        res.json({
            success: true,
            deployment_id: result.id,
            status: result.status,
            message: '模型部署已开始'
        });
        
    } catch (error) {
        console.error('Error deploying model:', error);
        res.status(500).json({
            success: false,
            error: '模型部署失败'
        });
    }
});

// 获取部署状态
app.get('/api/training/deploy/:deploymentId', async (req, res) => {
    try {
        const { deploymentId } = req.params;
        const results = await trainingAutomation.getDeploymentResults();
        
        if (!results[deploymentId]) {
            return res.status(404).json({
                success: false,
                error: '部署任务不存在'
            });
        }
        
        res.json({
            success: true,
            result: results[deploymentId]
        });
        
    } catch (error) {
        console.error('Error getting deployment status:', error);
        res.status(500).json({
            success: false,
            error: '获取部署状态失败'
        });
    }
});

// ==================== 营养分析 API ====================

// 分析单个食物营养
app.post('/api/nutrition/analyze', async (req, res) => {
    try {
        const { food_name, language = 'zh-CN' } = req.body;
        
        if (!food_name) {
            return res.status(400).json({
                success: false,
                error: '缺少食物名称'
            });
        }
        
        const nutritionInfo = await nutritionAnalysis.analyzeFoodNutrition(food_name, language);
        
        res.json({
            success: true,
            nutrition_info: nutritionInfo
        });
        
    } catch (error) {
        console.error('Error analyzing nutrition:', error);
        res.status(500).json({
            success: false,
            error: '营养分析失败'
        });
    }
});

// 批量分析食物营养
app.post('/api/nutrition/analyze-batch', async (req, res) => {
    try {
        const { food_names, language = 'zh-CN' } = req.body;
        
        if (!food_names || !Array.isArray(food_names)) {
            return res.status(400).json({
                success: false,
                error: '缺少食物名称列表'
            });
        }
        
        const nutritionResults = await nutritionAnalysis.analyzeMultipleFoods(food_names, language);
        
        res.json({
            success: true,
            nutrition_results: nutritionResults,
            total_analyzed: food_names.length
        });
        
    } catch (error) {
        console.error('Error analyzing batch nutrition:', error);
        res.status(500).json({
            success: false,
            error: '批量营养分析失败'
        });
    }
});

// 测试营养分析服务
app.get('/api/nutrition/test', async (req, res) => {
    try {
        const testResult = await nutritionAnalysis.testConnection();
        
        res.json({
            success: true,
            test_result: testResult,
            cache_stats: nutritionAnalysis.getCacheStats()
        });
        
    } catch (error) {
        console.error('Error testing nutrition service:', error);
        res.status(500).json({
            success: false,
            error: '营养分析服务测试失败'
        });
    }
});

// 清理营养分析缓存
app.post('/api/nutrition/clear-cache', (req, res) => {
    try {
        nutritionAnalysis.clearCache();
        
        res.json({
            success: true,
            message: '营养分析缓存已清理'
        });
        
    } catch (error) {
        console.error('Error clearing nutrition cache:', error);
        res.status(500).json({
            success: false,
            error: '清理缓存失败'
        });
    }
});

// ==================== 训练会话 API ====================

// 获取训练会话列表
app.get('/api/training/sessions', async (req, res) => {
    try {
        const sessions = await realDataService.getTrainingSessions();
        res.json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Error getting training sessions:', error);
        res.status(500).json({
            success: false,
            error: '获取训练会话失败'
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
                api_calls: apiCallCounter // 使用真实的API调用计数
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

// 清理缓存
app.post('/api/monitor/clear-cache', (req, res) => {
    try {
        realDataService.clearCache();
        res.json({
            success: true,
            message: '缓存已清理'
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({
            success: false,
            error: '清理缓存失败'
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

// ==================== 食物识别 API ====================

// 配置multer存储 - 保留原始扩展名
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        // 保留原始文件名和扩展名
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        // 生成唯一文件名，但保留扩展名
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片文件'), false);
        }
    }
});

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 食物识别分析API
app.post('/api/detection/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '请上传图片文件'
            });
        }

        const imagePath = req.file.path; // multer会设置完整路径
        const imageName = req.file.filename;
        
        console.log(`📸 收到图片上传: ${imageName}`);
        console.log(`📁 完整图片路径: ${imagePath}`);
        
        // 查找最新的训练模型
        const trainingSessions = readJsonFile(trainingSessionsFile);
        const sessions = Object.values(trainingSessions);
        const completedSessions = sessions.filter(s => s.status === 'completed' && s.best_model_path);
        
        if (completedSessions.length === 0) {
            // 清理临时文件
            fs.unlinkSync(imagePath);
            return res.status(404).json({
                success: false,
                error: '未找到训练好的模型，请先完成模型训练'
            });
        }
        
        // 使用最新的模型
        const latestSession = completedSessions.sort((a, b) => 
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )[0];
        
        const modelPath = path.isAbsolute(latestSession.best_model_path) 
            ? latestSession.best_model_path 
            : path.join(__dirname, '..', latestSession.best_model_path);
        
        // 检查模型文件是否存在
        if (!fs.existsSync(modelPath)) {
            fs.unlinkSync(imagePath);
            return res.status(404).json({
                success: false,
                error: '模型文件不存在: ' + modelPath
            });
        }
        
        console.log(`🤖 使用模型: ${modelPath}`);
        
        // 调用Python脚本进行推理（如果Python不可用，返回模拟结果用于演示）
        try {
            // 检查是否有Python环境
            const { stdout: pythonVersion } = await execPromise('python --version').catch(() => ({ stdout: '' }));
            const hasPython = pythonVersion.includes('Python');
            
            if (hasPython) {
                // 创建Python推理脚本
                // 转换Windows路径格式
                const modelPathEscaped = modelPath.replace(/\\/g, '\\\\');
                const imagePathEscaped = imagePath.replace(/\\/g, '\\\\');
                
                // 使用原始路径，Python会自动处理
                const modelPathNormalized = modelPath.replace(/\\/g, '/');
                const imagePathNormalized = imagePath.replace(/\\/g, '/');
                
                const pythonScript = `# -*- coding: utf-8 -*-
import sys
import json
import os
from pathlib import Path

# 设置输出编码
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

try:
    from ultralytics import YOLO
    
    model_path = r"${modelPathNormalized}"
    image_path = r"${imagePathNormalized}"
    
    # 验证文件存在
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"模型文件不存在: {model_path}")
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"图片文件不存在: {image_path}")
    
    # 加载模型
    model = YOLO(model_path)
    
    # 进行推理
    results = model(image_path, conf=0.25, save=False, verbose=False)
    
    detections = []
    for result in results:
        if hasattr(result, 'boxes') and result.boxes is not None:
            boxes = result.boxes
            for i in range(len(boxes)):
                box = boxes[i]
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].tolist()
                
                # 获取类别名称
                class_name = result.names[cls] if hasattr(result, 'names') and cls < len(result.names) else f"class_{cls}"
                
                detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "bbox": [xyxy[0], xyxy[1], xyxy[2] - xyxy[0], xyxy[3] - xyxy[1]]
                })
    
    print(json.dumps({"success": True, "detections": detections}, ensure_ascii=False))
except FileNotFoundError as e:
    print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False))
    sys.exit(1)
except ImportError as e:
    print(json.dumps({"success": False, "error": f"导入错误: {str(e)}. 请确保已安装ultralytics: pip install ultralytics"}, ensure_ascii=False))
    sys.exit(1)
except Exception as e:
    import traceback
    error_msg = f"{type(e).__name__}: {str(e)}"
    traceback_str = traceback.format_exc()
    print(json.dumps({"success": False, "error": error_msg, "traceback": traceback_str}, ensure_ascii=False))
    sys.exit(1)
`;
                
                const scriptPath = path.join(uploadsDir, `inference_${Date.now()}.py`);
                fs.writeFileSync(scriptPath, pythonScript, 'utf8');
                
                console.log(`📝 Python脚本已创建: ${scriptPath}`);
                console.log(`🤖 模型路径: ${modelPath}`);
                console.log(`📸 图片路径: ${imagePath}`);
                
                // 执行Python脚本 - 使用绝对路径并捕获详细错误
                let stdout, stderr;
                try {
                    const command = `python "${scriptPath}" 2>&1`;
                    const result = await execPromise(command, { 
                        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
                        cwd: path.dirname(scriptPath)
                    });
                    stdout = result.stdout;
                    stderr = result.stderr;
                    
                    console.log(`✅ Python执行成功`);
                    console.log(`📤 输出: ${stdout.substring(0, 200)}`);
                } catch (execError) {
                    stdout = execError.stdout || '';
                    stderr = execError.stderr || execError.message || '';
                    console.error(`❌ Python执行失败:`, execError);
                    console.error(`📥 标准输出:`, stdout);
                    console.error(`📥 标准错误:`, stderr);
                    
                    // 清理文件
                    if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
                    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
                    
                    return res.status(500).json({
                        success: false,
                        error: `Python执行失败: ${stderr || execError.message || '未知错误'}`,
                        details: {
                            script: scriptPath,
                            model: modelPath,
                            python_error: stderr
                        }
                    });
                }
                
                // 清理Python脚本
                if (fs.existsSync(scriptPath)) {
                    fs.unlinkSync(scriptPath);
                }
                
                // 解析结果
                let result;
                try {
                    result = JSON.parse(stdout.trim());
                } catch (parseError) {
                    console.error(`❌ JSON解析失败:`, parseError);
                    console.error(`📥 原始输出:`, stdout);
                    
                    // 清理临时图片
                    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
                    
                    return res.status(500).json({
                        success: false,
                        error: `结果解析失败: ${parseError.message}`,
                        raw_output: stdout.substring(0, 500)
                    });
                }
                
                // 清理临时图片
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                
                if (result.success) {
                    res.json({
                        success: true,
                        detections: result.detections,
                        model_used: latestSession.id,
                        model_name: latestSession.name || 'Latest Model'
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        error: result.error || '推理失败',
                        details: result
                    });
                }
            } else {
                // Python不可用，返回模拟结果（用于演示）
                console.log('⚠️ Python环境不可用，返回模拟结果');
                const mockResult = {
                    success: true,
                    detections: [
                        {
                            class: "Char Kway Teow",
                            confidence: 0.95,
                            bbox: [100, 100, 300, 200]
                        }
                    ],
                    model_used: latestSession.id,
                    model_name: latestSession.name || 'Latest Model',
                    note: '模拟结果 - 请安装Python和ultralytics包以使用真实推理'
                };
                
                // 清理临时图片
                fs.unlinkSync(imagePath);
                
                res.json(mockResult);
            }
        } catch (pythonError) {
            console.error('Python推理错误:', pythonError);
            // 清理临时文件
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            
            res.status(500).json({
                success: false,
                error: '推理服务错误: ' + pythonError.message
            });
        }
        
    } catch (error) {
        console.error('Error in detection API:', error);
        // 清理临时文件
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: '处理图片失败: ' + error.message
        });
    }
});

// ==================== 前端路由 ====================

// 根路径加载主dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 兜底：处理未知路径
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        // API路径但没有匹配的路由
        res.status(404).json({
            success: false,
            error: 'API endpoint not found',
            method: req.method,
            path: req.path,
            available_endpoints: [
                'GET /api/monitor/health',
                'GET /api/monitor/stats',
                'GET /api/training/colab/templates',
                'GET /api/datasets',
                'GET /api/models/versions',
                'POST /api/detection/analyze'
            ]
        });
    } else if (req.method === 'GET') {
        // 非API的GET请求重定向到首页
        res.redirect('/');
    } else {
        // 其他请求返回404
        res.status(404).json({
            success: false,
            error: 'Not found'
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    // 从文件加载API调用计数
    try {
        const stats = readJsonFile(systemStatsFile);
        apiCallCounter = stats.api_calls || 0;
        console.log(`📊 已加载API调用计数: ${apiCallCounter}`);
    } catch (error) {
        console.log('⚠️ 无法加载API调用计数，从0开始');
    }
    
    console.log(`🚀 NutriScan Backend Dashboard 服务器运行在端口 ${PORT}`);
    console.log(`📊 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 API文档: http://localhost:${PORT}/api`);
});

module.exports = app;
