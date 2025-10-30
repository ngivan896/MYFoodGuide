// 真实数据集服务 - 连接到本地马来西亚食物数据集
const fs = require('fs');
const path = require('path');

class RealDatasetService {
    constructor() {
        this.datasetPath = path.join(__dirname, '..', 'malaysian_food_dataset');
        this.dataYamlPath = path.join(this.datasetPath, 'data.yaml');
    }

    // 获取数据集信息
    async getDatasetInfo() {
        try {
            if (!fs.existsSync(this.dataYamlPath)) {
                throw new Error('数据集配置文件不存在');
            }

            const yamlContent = fs.readFileSync(this.dataYamlPath, 'utf8');
            const config = this.parseYaml(yamlContent);
            
            // 获取实际的文件统计
            const stats = await this.getDatasetStats();
            
            return {
                id: 'malaysian_food_dataset',
                name: '马来西亚食物识别数据集',
                description: '包含8种马来西亚传统食物的YOLO格式数据集',
                type: 'yolo',
                source: 'local',
                status: 'ready',
                created_at: this.getCreationTime(),
                updated_at: new Date().toISOString(),
                file_count: stats.total_images,
                total_size: stats.total_size,
                classes: config.nc,
                class_names: config.names,
                splits: {
                    train: stats.train_images,
                    valid: stats.valid_images,
                    test: stats.test_images
                },
                path: this.datasetPath,
                config: config
            };
        } catch (error) {
            console.error('获取数据集信息失败:', error);
            throw error;
        }
    }

    // 获取数据集统计信息
    async getDatasetStats() {
        const stats = {
            total_images: 0,
            train_images: 0,
            valid_images: 0,
            test_images: 0,
            total_size: 0
        };

        try {
            // 统计训练集
            const trainImagesPath = path.join(this.datasetPath, 'train', 'images');
            if (fs.existsSync(trainImagesPath)) {
                const trainFiles = fs.readdirSync(trainImagesPath);
                stats.train_images = trainFiles.filter(f => f.match(/\.(jpg|jpeg|png)$/i)).length;
                stats.total_images += stats.train_images;
            }

            // 统计验证集
            const validImagesPath = path.join(this.datasetPath, 'valid', 'images');
            if (fs.existsSync(validImagesPath)) {
                const validFiles = fs.readdirSync(validImagesPath);
                stats.valid_images = validFiles.filter(f => f.match(/\.(jpg|jpeg|png)$/i)).length;
                stats.total_images += stats.valid_images;
            }

            // 统计测试集
            const testImagesPath = path.join(this.datasetPath, 'test', 'images');
            if (fs.existsSync(testImagesPath)) {
                const testFiles = fs.readdirSync(testImagesPath);
                stats.test_images = testFiles.filter(f => f.match(/\.(jpg|jpeg|png)$/i)).length;
                stats.total_images += stats.test_images;
            }

            // 计算总大小
            stats.total_size = await this.calculateDirectorySize(this.datasetPath);

        } catch (error) {
            console.error('统计数据集失败:', error);
        }

        return stats;
    }

    // 计算目录大小
    async calculateDirectorySize(dirPath) {
        let totalSize = 0;
        
        try {
            const files = fs.readdirSync(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    totalSize += await this.calculateDirectorySize(filePath);
                } else {
                    totalSize += stat.size;
                }
            }
        } catch (error) {
            console.error('计算目录大小失败:', error);
        }
        
        return this.formatBytes(totalSize);
    }

    // 格式化字节大小
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 获取文件创建时间
    getCreationTime() {
        try {
            const stat = fs.statSync(this.datasetPath);
            return stat.birthtime.toISOString();
        } catch (error) {
            return new Date().toISOString();
        }
    }

    // 简单YAML解析器
    parseYaml(content) {
        const lines = content.split('\n');
        const config = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex > 0) {
                    const key = trimmed.substring(0, colonIndex).trim();
                    let value = trimmed.substring(colonIndex + 1).trim();
                    
                    // 处理数组值
                    if (value.startsWith('[') && value.endsWith(']')) {
                        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
                    }
                    
                    // 处理数字值
                    if (!isNaN(value) && value !== '') {
                        value = Number(value);
                    }
                    
                    config[key] = value;
                }
            }
        }
        
        return config;
    }

    // 获取训练配置模板
    getTrainingConfig() {
        return {
            dataset_path: this.datasetPath,
            data_yaml: this.dataYamlPath,
            model_type: 'yolov8n',
            epochs: 100,
            batch_size: 16,
            learning_rate: 0.01,
            img_size: 640,
            patience: 20,
            save_period: 10,
            augment: true,
            optimizer: 'AdamW',
            loss_function: 'BCE'
        };
    }

    // 验证数据集完整性
    async validateDataset() {
        const issues = [];
        
        try {
            // 检查必要文件
            if (!fs.existsSync(this.dataYamlPath)) {
                issues.push('缺少data.yaml配置文件');
            }

            // 检查目录结构
            const requiredDirs = ['train/images', 'train/labels', 'valid/images', 'valid/labels', 'test/images', 'test/labels'];
            for (const dir of requiredDirs) {
                const dirPath = path.join(this.datasetPath, dir);
                if (!fs.existsSync(dirPath)) {
                    issues.push(`缺少目录: ${dir}`);
                }
            }

            // 检查图片和标签文件匹配
            const splits = ['train', 'valid', 'test'];
            for (const split of splits) {
                const imagesPath = path.join(this.datasetPath, split, 'images');
                const labelsPath = path.join(this.datasetPath, split, 'labels');
                
                if (fs.existsSync(imagesPath) && fs.existsSync(labelsPath)) {
                    const imageFiles = fs.readdirSync(imagesPath).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
                    const labelFiles = fs.readdirSync(labelsPath).filter(f => f.endsWith('.txt'));
                    
                    for (const imageFile of imageFiles) {
                        const baseName = path.parse(imageFile).name;
                        const labelFile = `${baseName}.txt`;
                        if (!labelFiles.includes(labelFile)) {
                            issues.push(`${split}集缺少标签文件: ${labelFile}`);
                        }
                    }
                }
            }

        } catch (error) {
            issues.push(`验证过程出错: ${error.message}`);
        }

        return {
            valid: issues.length === 0,
            issues: issues,
            dataset_path: this.datasetPath
        };
    }

    // 获取数据集预览
    async getDatasetPreview() {
        try {
            const preview = {
                images: [],
                classes: []
            };

            // 获取类别信息
            const datasetInfo = await this.getDatasetInfo();
            preview.classes = datasetInfo.class_names;

            // 获取一些示例图片
            const trainImagesPath = path.join(this.datasetPath, 'train', 'images');
            if (fs.existsSync(trainImagesPath)) {
                const imageFiles = fs.readdirSync(trainImagesPath)
                    .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
                    .slice(0, 6); // 只取前6张作为预览
                
                preview.images = imageFiles.map(file => ({
                    filename: file,
                    path: path.join(trainImagesPath, file),
                    class: this.extractClassFromFilename(file)
                }));
            }

            return preview;
        } catch (error) {
            console.error('获取数据集预览失败:', error);
            return { images: [], classes: [] };
        }
    }

    // 从文件名提取类别
    extractClassFromFilename(filename) {
        const baseName = path.parse(filename).name;
        // 假设文件名格式为 "class_name_sample_number"
        const parts = baseName.split('_');
        if (parts.length >= 2) {
            return parts.slice(0, -1).join('_'); // 去掉最后的数字部分
        }
        return 'unknown';
    }
}

module.exports = new RealDatasetService();

