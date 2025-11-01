// 真实数据服务
const apiConfig = require('../config/api-config');
const axios = require('axios');
// 移除未使用的引用，避免潜在循环依赖和linter告警

class RealDataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
    }

    // 缓存管理
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // 获取训练会话数据
    async getTrainingSessions() {
        const cacheKey = 'training_sessions';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // 尝试从自定义训练API获取数据
            const customConfig = apiConfig.getConfig('custom');
            if (customConfig.trainingAPI?.baseUrl) {
                const client = apiConfig.createAPIClient('custom');
                const response = await client.get('/training/sessions');
                const data = response.data;
                this.setCachedData(cacheKey, data);
                return data;
            }

            // 从本地文件系统获取真实的训练会话数据
            const fs = require('fs');
            const path = require('path');
            
            try {
                const trainingSessionsFile = path.join(__dirname, '..', 'data', 'training_sessions.json');
                if (fs.existsSync(trainingSessionsFile)) {
                    const fileData = fs.readFileSync(trainingSessionsFile, 'utf8');
                    const sessionsData = JSON.parse(fileData);
                    
                    // 转换文件数据为数组格式
                    const sessions = Object.values(sessionsData).map(session => ({
                        id: session.id,
                        name: `训练会话 ${session.id.substring(0, 8)}`,
                        status: session.status || 'completed',
                        progress: session.progress || 100,
                        startTime: session.created_at,
                        endTime: session.completed_at,
                        // 前端显示创建时间使用 created_at 字段
                        created_at: session.created_at,
                        config: session.model_config || {
                            epochs: 100,
                            batch_size: 16,
                            learning_rate: 0.01,
                            img_size: 640
                        },
                        dataset_id: session.dataset_id,
                        colab_url: session.colab_url,
                        metrics: session.metrics || {},
                        nutrition_analysis: session.nutrition_analysis || {}
                    }));
                    
                    console.log('✅ 从本地文件获取训练会话数据成功');
                    this.setCachedData(cacheKey, sessions);
                    return sessions;
                }
            } catch (fileError) {
                console.error('读取本地训练会话文件失败:', fileError);
            }

            // 如果没有真实数据，返回模拟数据
            return this.getMockTrainingSessions();
        } catch (error) {
            console.error('Error fetching training sessions:', error);
            return this.getMockTrainingSessions();
        }
    }

    // 获取数据集数据
    async getDatasets() {
        const cacheKey = 'datasets';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // 仅读取 Roboflow 数据集（只读）
            const roboflowConfig = apiConfig.getConfig('roboflow');
            if (roboflowConfig.apiKey && roboflowConfig.projectId) {
                console.log('🔗 正在从Roboflow获取数据集数据...');
                const client = apiConfig.createAPIClient('roboflow');
                try {
                    // 获取项目信息和统计
                    const workspace = roboflowConfig.workspace || roboflowConfig.ws || roboflowConfig.org || '';
                    const apiKeyQ = roboflowConfig.apiKey ? `?api_key=${encodeURIComponent(roboflowConfig.apiKey)}` : '';
                    const projectPath = workspace ? `/${workspace}/${roboflowConfig.projectId}${apiKeyQ}` : `/${roboflowConfig.projectId}${apiKeyQ}`;
                    const statsPath = workspace ? `/${workspace}/${roboflowConfig.projectId}/stats${apiKeyQ}` : `/${roboflowConfig.projectId}/stats${apiKeyQ}`;
                    const projectResp = await client.get(projectPath);
                    const statsResp = await client.get(statsPath).catch(() => ({ data: {} }));
                    // 额外尝试：读取版本列表中的样本/图片数量
                    let versionsCount = undefined;
                    try {
                        const versionsPath = workspace ? `/${workspace}/${roboflowConfig.projectId}/versions${apiKeyQ}` : `/${roboflowConfig.projectId}/versions${apiKeyQ}`;
                        const versionsResp = await client.get(versionsPath);
                        const versions = versionsResp.data?.versions || [];
                        const latest = versions[0] || null;
                        if (latest) {
                            const vcands = [latest.images, latest.samples, latest.sample_count, latest.num_images];
                            const vn = vcands.find(v => typeof v === 'number' && !Number.isNaN(v));
                            if (typeof vn === 'number') versionsCount = vn;
                        }
                    } catch (_) {}
                    const roboflowData = { workspace: roboflowConfig.workspace };
                    const data = await this.transformRoboflowData({ ...roboflowData, projectResp: projectResp.data, statsResp: statsResp.data, versionsCount });
                    // 用最新的名称与统计覆盖（transform 内部也会做一次兜底）
                    if (data && data.datasets && data.datasets[0]) {
                        const ds = data.datasets[0];
                        const prjRoot = projectResp.data || {};
                        const prj = prjRoot.project || prjRoot; // 兼容 { project: {...} } 或直接平铺
                        ds.name = prj.name || ds.name;
                        ds.description = prj.description || ds.description;
                        const stRoot = statsResp.data || {};
                        const st = stRoot.project || stRoot; // 兼容 { project: {...} }
                        const candidates = [
                            st.images,
                            prj.images,
                            prj.num_images,
                            prj.image_count,
                            prj.images_count,
                            prj.samples,
                            prj.sample_count,
                            prj.numImages,
                            versionsCount
                        ];
                        const firstNumber = candidates.find(v => typeof v === 'number' && !Number.isNaN(v));
                        if (typeof firstNumber === 'number') {
                            ds.file_count = firstNumber;
                        }
                        // 覆盖 splits：优先 stats，其次 project.splits
                        const prjSplits = prj.splits || {};
                        ds.splits = {
                            train: typeof st.train === 'number' ? st.train : (typeof prjSplits.train === 'number' ? prjSplits.train : 0),
                            valid: typeof st.valid === 'number' ? st.valid : (typeof prjSplits.valid === 'number' ? prjSplits.valid : 0),
                            test: typeof st.test === 'number' ? st.test : (typeof prjSplits.test === 'number' ? prjSplits.test : 0),
                        };
                        // 添加类别分布信息 - 确保从 prj.classes 获取
                        if (prj.classes && typeof prj.classes === 'object' && !Array.isArray(prj.classes)) {
                            ds.class_distribution = prj.classes;
                            console.log('📊 类别分布数据已添加:', JSON.stringify(prj.classes));
                        } else {
                            console.warn('⚠️ 未找到类别分布数据，prj.classes:', prj.classes, '类型:', typeof prj.classes);
                            // 如果 transformRoboflowData 已经设置了，保留它
                            if (!ds.class_distribution || Object.keys(ds.class_distribution).length === 0) {
                                console.warn('⚠️ class_distribution 为空或不存在');
                            }
                        }
                    }
                    // 清除旧缓存以确保使用最新数据
                    this.cache.delete(cacheKey);
                    this.setCachedData(cacheKey, data);
                    console.log('✅ Roboflow数据获取成功，包含class_distribution:', !!data.datasets[0]?.class_distribution);
                    return data;
                } catch (e) {
                    console.error('从Roboflow获取数据失败:', e);
                }
            }

            // 尝试从自定义数据集API获取
            const customConfig = apiConfig.getConfig('custom');
            if (customConfig.datasetAPI?.baseUrl) {
                const client = apiConfig.createAPIClient('custom');
                const response = await client.get('/datasets');
                const data = response.data;
                this.setCachedData(cacheKey, data);
                return data;
            }

            // 默认返回空（不再返回模拟数据）
            const empty = { datasets: [] };
            this.setCachedData(cacheKey, empty);
            return empty;
        } catch (error) {
            console.error('Error fetching datasets:', error);
            return { datasets: [] };
        }
    }

    // 获取模型数据
    async getModels() {
        const cacheKey = 'models';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // 1) 优先使用本地真实训练会话作为模型来源
            try {
                const fs = require('fs');
                const path = require('path');
                const sessionsFile = path.join(__dirname, '..', 'data', 'training_sessions.json');
                if (fs.existsSync(sessionsFile)) {
                    const sessionsContent = fs.readFileSync(sessionsFile, 'utf8');
                    const sessions = JSON.parse(sessionsContent);
                    const sessionArray = Object.values(sessions);

                    const modelsFromSessions = sessionArray.map((s, idx) => {
                        // 取主要指标（mAP50 或 mAP50-95)
                        const mAP50 = s.metrics?.['metrics/mAP50(B)'];
                        const mAP5095 = s.metrics?.['metrics/mAP50-95(B)'];
                        // 计算best文件大小（MB）
                        let fileSize = 0;
                        try {
                            if (s.best_model_path) {
                                const bestAbs = path.isAbsolute(s.best_model_path)
                                    ? s.best_model_path
                                    : path.join(__dirname, '..', s.best_model_path);
                                if (fs.existsSync(bestAbs)) {
                                    fileSize = +(fs.statSync(bestAbs).size / 1024 / 1024).toFixed(1);
                                }
                            }
                        } catch (_) {}

                        return {
                            id: s.id || `model_${idx + 1}`,
                            name: `YOLO ${s.model_config?.model_type || 'model'}`,
                            version: s.created_at || new Date().toISOString(),
                            accuracy: typeof mAP50 === 'number' ? mAP50 : (typeof mAP5095 === 'number' ? mAP5095 : undefined),
                            status: 'active',
                            file_size: fileSize || undefined,
                            created_at: s.created_at,
                            inference_time: undefined,
                            classes: Array.isArray(s.model_config?.names) ? s.model_config.names.length : undefined,
                            source: 'local',
                            best_model_path: s.best_model_path,
                            exported_models: s.exported_models || {}
                        };
                    });

                    if (modelsFromSessions.length > 0) {
                        this.setCachedData(cacheKey, modelsFromSessions);
                        return modelsFromSessions;
                    }
                }
            } catch (localErr) {
                console.error('读取本地训练会话生成模型失败:', localErr);
            }

            // 尝试从自定义模型API获取数据
            const customConfig = apiConfig.getConfig('custom');
            if (customConfig.modelAPI?.baseUrl) {
                const client = apiConfig.createAPIClient('custom');
                const response = await client.get('/models');
                const data = response.data;
                this.setCachedData(cacheKey, data);
                return data;
            }

            // 尝试从Roboflow获取模型信息
            const roboflowConfig = apiConfig.getConfig('roboflow');
            if (roboflowConfig.apiKey && roboflowConfig.projectId) {
                console.log('🔗 正在从Roboflow获取模型数据...');
                const client = apiConfig.createAPIClient('roboflow');
                
                try {
                    // 获取项目版本信息（模型版本）
                    const workspace = roboflowConfig.workspace || roboflowConfig.ws || roboflowConfig.org || '';
                    const apiKeyQ = roboflowConfig.apiKey ? `?api_key=${encodeURIComponent(roboflowConfig.apiKey)}` : '';
                    const versionsPath = workspace ? `/${workspace}/${roboflowConfig.projectId}/versions${apiKeyQ}` : `/${roboflowConfig.projectId}/versions${apiKeyQ}`;
                    const versionsResponse = await client.get(versionsPath);
                    const versionsData = versionsResponse.data;
                    
                    const models = versionsData.versions?.map((version, index) => ({
                        id: `model_${version.id || index + 1}`,
                        name: `YOLOv8 Malaysian Food v${version.version || '1.0.0'}`,
                        version: version.version || '1.0.0',
                        accuracy: version.metrics?.mAP || 0.85,
                        status: version.status || 'active',
                        file_size: version.size || 6.2,
                        created_at: version.created || new Date().toISOString(),
                        inference_time: 15 + (index * 5), // 基于版本估算
                        classes: 20,
                        source: 'roboflow',
                        project_id: roboflowConfig.projectId,
                        version_id: version.id
                    })) || [];
                    
                    console.log('✅ Roboflow模型数据获取成功');
                    this.setCachedData(cacheKey, models);
                    return models;
                } catch (roboflowError) {
                    console.error('从Roboflow获取模型数据失败:', roboflowError);
                }
            }

            return this.getMockModels();
        } catch (error) {
            console.error('Error fetching models:', error);
            return this.getMockModels();
        }
    }

    // 获取系统统计
    async getSystemStats() {
        try {
            // 获取真实统计信息
            const stats = {
                api_calls: this.getRealAPICallCount(),
                errors: 0,
                uptime: Date.now(),
                active_sessions: 0,
                memory_usage: this.getMemoryUsage(),
                cpu_usage: this.getCPUUsage()
            };

            // 获取训练会话统计
            const trainingSessions = await this.getTrainingSessions();
            stats.active_sessions = trainingSessions.filter(s => s.status === 'running' || s.status === 'training' || s.status === 'initializing').length;
            stats.completed_sessions = trainingSessions.filter(s => s.status === 'completed').length;
            stats.ready_sessions = trainingSessions.filter(s => s.status === 'ready').length;

            // 获取数据集统计 - 不使用缓存，确保数据最新
            const datasetsResponse = await this.getDatasets();
            const datasets = datasetsResponse.datasets || datasetsResponse || [];
            stats.total_datasets = Array.isArray(datasets) ? datasets.length : 0;
            stats.total_images = Array.isArray(datasets) ? datasets.reduce((sum, dataset) => sum + (dataset.file_count || 0), 0) : 0;

            // 获取模型统计
            const models = await this.getModels();
            stats.total_models = models.length;
            stats.active_models = models.filter(m => m.status === 'active').length;

            // 缓存结果
            this.setCachedData('system_stats', stats);
            return stats;
        } catch (error) {
            console.error('Error fetching system stats:', error);
            return this.getMockSystemStats();
        }
    }

    // 获取内存使用情况
    getMemoryUsage() {
        const used = process.memoryUsage();
        return `${Math.round(used.heapUsed / 1024 / 1024)}MB`;
    }

    // 获取CPU使用情况
    getCPUUsage() {
        const os = require('os');
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - ~~(100 * idle / total);
        
        return `${usage}%`;
    }

    // 清理缓存
    clearCache() {
        this.cache.clear();
        console.log('✅ 缓存已清理');
    }

    // 启动训练
    async startTraining(trainingConfig) {
        try {
            const customConfig = apiConfig.getConfig('custom');
            if (customConfig.trainingAPI?.baseUrl) {
                const client = apiConfig.createAPIClient('custom');
                const response = await client.post('/training/start', trainingConfig);
                return response.data;
            }

            // 如果没有真实API，返回模拟响应
            return {
                success: true,
                session_id: `session_${Date.now()}`,
                message: 'Training started (simulated)',
                colab_url: 'https://colab.research.google.com/drive/simulated'
            };
        } catch (error) {
            console.error('Error starting training:', error);
            throw error;
        }
    }

    // 转换Roboflow数据格式
    async transformRoboflowData(roboflowData) {
        console.log('🔄 转换Roboflow数据:', roboflowData);
        
        try {
            // 获取更详细的Roboflow项目信息
            const roboflowConfig = apiConfig.getConfig('roboflow');
            const client = apiConfig.createAPIClient('roboflow');
            
            // 获取项目详细信息
            const workspace = roboflowConfig.workspace || roboflowConfig.ws || roboflowConfig.org || '';
            const apiKeyQ = roboflowConfig.apiKey ? `?api_key=${encodeURIComponent(roboflowConfig.apiKey)}` : '';
            const projectPath = workspace ? `/${workspace}/${roboflowConfig.projectId}${apiKeyQ}` : `/${roboflowConfig.projectId}${apiKeyQ}`;
            const projectResponse = roboflowData.projectResp ? { data: roboflowData.projectResp } : await client.get(projectPath);
            // 兼容不同的响应格式：可能是 { project: {...} } 或直接是 project 对象
            const projectDataRaw = projectResponse.data || {};
            const projectData = projectDataRaw.project || projectDataRaw;
            console.log('🔍 transformRoboflowData - projectData.classes:', projectData.classes);
            
            // 获取数据集统计信息
            const statsPath = workspace ? `/${workspace}/${roboflowConfig.projectId}/stats${apiKeyQ}` : `/${roboflowConfig.projectId}/stats${apiKeyQ}`;
            const statsResponse = roboflowData.statsResp ? { data: roboflowData.statsResp } : await client.get(statsPath).catch(() => ({ data: {} }));
            const statsDataRaw = statsResponse.data || {};
            const statsData = statsDataRaw.project || statsDataRaw;

            // 版本图片数兜底
            const versionsCount = typeof roboflowData.versionsCount === 'number' ? roboflowData.versionsCount : undefined;
            
            const datasets = [{
                id: 'roboflow_main',
                name: projectData.name || 'Malaysian Food Detection Dataset',
                description: projectData.description || `Roboflow项目: ${roboflowData.workspace || 'malaysian-food-detection'}`,
                type: 'yolo',
                source: 'roboflow',
                status: 'ready',
                created_at: projectData.created || new Date().toISOString(),
                file_count: typeof statsData.images === 'number' ? statsData.images : (
                    typeof projectData.images === 'number' ? projectData.images : (typeof versionsCount === 'number' ? versionsCount : 0)
                ),
                total_size: this.formatBytes(typeof statsData.size === 'number' ? statsData.size : 0),
                workspace: roboflowData.workspace,
                api_status: 'connected',
                classes: typeof statsData.classes === 'number' ? statsData.classes : undefined,
                annotations: typeof statsData.annotations === 'number' ? statsData.annotations : 0,
                splits: {
                    train: typeof statsData.train === 'number' ? statsData.train : (projectData.splits?.train ?? 0),
                    valid: typeof statsData.valid === 'number' ? statsData.valid : (projectData.splits?.valid ?? 0),
                    test: typeof statsData.test === 'number' ? statsData.test : (projectData.splits?.test ?? 0)
                },
                // 添加类别分布信息 - 确保正确获取
                class_distribution: (projectData.classes && typeof projectData.classes === 'object' && !Array.isArray(projectData.classes) && Object.keys(projectData.classes).length > 0) ? projectData.classes : {}
            }];
            
            return { datasets };
        } catch (error) {
            console.error('获取详细Roboflow数据失败:', error);
            // 严格回退为空，避免任何伪数据
            return { datasets: [] };
        }
    }

    // 格式化字节大小
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 模拟数据（当没有真实API时使用）
    getMockTrainingSessions() {
        return [
            {
                id: 'session_1',
                name: 'YOLOv8n 基础训练',
                status: 'running',
                progress: 65,
                startTime: '2024-01-15T10:30:00Z',
                estimatedTime: '2h 30m',
                config: {
                    epochs: 100,
                    batch_size: 16,
                    learning_rate: 0.01,
                    img_size: 640
                }
            },
            {
                id: 'session_2',
                name: 'YOLOv8s 高级训练',
                status: 'completed',
                progress: 100,
                startTime: '2024-01-14T14:20:00Z',
                endTime: '2024-01-15T08:45:00Z',
                config: {
                    epochs: 150,
                    batch_size: 32,
                    learning_rate: 0.005,
                    img_size: 640
                }
            }
        ];
    }

    getMockDatasets() {
        // 返回空数组，确保只显示真实数据
        return [];
    }

    getMockModels() {
        return [
            {
                id: 'model_1',
                name: 'YOLOv8n Malaysian Food',
                version: '1.0.0',
                accuracy: 0.89,
                status: 'active',
                file_size: 6.2,
                created_at: '2024-01-15T12:00:00Z',
                inference_time: 15,
                classes: 20
            },
            {
                id: 'model_2',
                name: 'YOLOv8s Malaysian Food',
                version: '1.1.0',
                accuracy: 0.92,
                status: 'training',
                file_size: 21.5,
                created_at: '2024-01-14T10:30:00Z',
                inference_time: 22,
                classes: 20
            }
        ];
    }

    getMockSystemStats() {
        return {
            api_calls: 0,
            errors: 0,
            uptime: Date.now(),
            active_sessions: 0,
            completed_sessions: 0,
            ready_sessions: 0,
            total_datasets: 0,
            total_images: 0,
            total_models: 0,
            active_models: 0,
            memory_usage: this.getMemoryUsage(),
            cpu_usage: this.getCPUUsage()
        };
    }

    /**
     * 获取真实的API调用次数
     */
    getRealAPICallCount() {
        // 从系统统计文件读取真实的API调用次数
        try {
            const fs = require('fs');
            const path = require('path');
            const systemStatsFile = path.join(__dirname, '..', 'data', 'system_stats.json');
            
            if (fs.existsSync(systemStatsFile)) {
                const stats = JSON.parse(fs.readFileSync(systemStatsFile, 'utf8'));
                return stats.api_calls || 0;
            }
        } catch (error) {
            console.error('Error reading API call count:', error);
        }
        
        return 0;
    }
}

module.exports = new RealDataService();
