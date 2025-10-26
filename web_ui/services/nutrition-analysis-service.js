/**
 * 🍜 NutriScan MY - Gemini AI 营养分析服务
 * 集成Google Gemini AI进行马来西亚食物营养分析
 */

const axios = require('axios');

class NutritionAnalysisService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-2.0-flash';
        this.cache = new Map();
        this.cacheTimeout = 24 * 60 * 60 * 1000; // 24小时缓存
    }

    /**
     * 分析单个食物的营养信息
     */
    async analyzeFoodNutrition(foodName, language = 'zh-CN') {
        try {
            // 检查缓存
            const cacheKey = `nutrition_${foodName}_${language}`;
            const cached = this.getCachedResult(cacheKey);
            if (cached) {
                return cached;
            }

            console.log(`🧠 正在分析食物营养: ${foodName}`);

            const prompt = this.buildNutritionPrompt(foodName, language);
            const response = await this.callGeminiAPI(prompt);

            const nutritionInfo = this.parseNutritionResponse(response, foodName);
            
            // 缓存结果
            this.setCachedResult(cacheKey, nutritionInfo);

            return nutritionInfo;

        } catch (error) {
            console.error(`❌ 营养分析失败 (${foodName}):`, error);
            return this.getFallbackNutritionInfo(foodName);
        }
    }

    /**
     * 批量分析多个食物的营养信息
     */
    async analyzeMultipleFoods(foodNames, language = 'zh-CN') {
        try {
            console.log(`🧠 批量分析 ${foodNames.length} 种食物营养信息`);

            const results = {};
            const promises = foodNames.map(async (foodName) => {
                try {
                    const nutrition = await this.analyzeFoodNutrition(foodName, language);
                    results[foodName] = nutrition;
                } catch (error) {
                    console.error(`单个食物分析失败 (${foodName}):`, error);
                    results[foodName] = this.getFallbackNutritionInfo(foodName);
                }
            });

            await Promise.all(promises);
            return results;

        } catch (error) {
            console.error('❌ 批量营养分析失败:', error);
            return this.getFallbackMultipleNutritionInfo(foodNames);
        }
    }

    /**
     * 构建营养分析提示词
     */
    buildNutritionPrompt(foodName, language) {
        const languagePrompts = {
            'zh-CN': `
请详细分析以下马来西亚食物的营养信息：${foodName}

请提供以下信息（请用中文回答）：

1. **基本营养信息**：
   - 卡路里 (每100克)
   - 蛋白质 (克)
   - 碳水化合物 (克)
   - 脂肪 (克)
   - 纤维 (克)

2. **维生素含量**：
   - 维生素A、C、D、E、K
   - B族维生素 (B1, B2, B3, B6, B12)
   - 叶酸

3. **矿物质含量**：
   - 钙、铁、镁、磷、钾、钠、锌

4. **健康建议**：
   - 适合的食用时间
   - 健康益处
   - 注意事项
   - 推荐搭配

5. **马来西亚文化背景**：
   - 传统制作方法
   - 文化意义
   - 地区特色

请用清晰的格式回答，包含具体数值和建议。
            `,
            'en': `
Please provide detailed nutritional analysis for this Malaysian food: ${foodName}

Please provide the following information (in English):

1. **Basic Nutritional Information** (per 100g):
   - Calories
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
   - Fiber (g)

2. **Vitamin Content**:
   - Vitamins A, C, D, E, K
   - B-complex vitamins (B1, B2, B3, B6, B12)
   - Folate

3. **Mineral Content**:
   - Calcium, Iron, Magnesium, Phosphorus, Potassium, Sodium, Zinc

4. **Health Recommendations**:
   - Best time to consume
   - Health benefits
   - Precautions
   - Recommended combinations

5. **Malaysian Cultural Context**:
   - Traditional preparation methods
   - Cultural significance
   - Regional variations

Please provide specific values and clear recommendations.
            `,
            'ms': `
Sila berikan analisis pemakanan terperinci untuk makanan Malaysia ini: ${foodName}

Sila berikan maklumat berikut (dalam Bahasa Melayu):

1. **Maklumat Pemakanan Asas** (per 100g):
   - Kalori
   - Protein (g)
   - Karbohidrat (g)
   - Lemak (g)
   - Serat (g)

2. **Kandungan Vitamin**:
   - Vitamin A, C, D, E, K
   - Vitamin B-kompleks (B1, B2, B3, B6, B12)
   - Folat

3. **Kandungan Mineral**:
   - Kalsium, Besi, Magnesium, Fosforus, Kalium, Natrium, Zink

4. **Cadangan Kesihatan**:
   - Masa terbaik untuk dimakan
   - Kebaikan kesihatan
   - Langkah berjaga-jaga
   - Gabungan yang disyorkan

5. **Konteks Budaya Malaysia**:
   - Kaedah penyediaan tradisional
   - Kepentingan budaya
   - Variasi serantau

Sila berikan nilai khusus dan cadangan yang jelas.
            `
        };

        return languagePrompts[language] || languagePrompts['zh-CN'];
    }

    /**
     * 调用Gemini API
     */
    async callGeminiAPI(prompt) {
        try {
            const url = `${this.baseUrl}/models/${this.model}:generateContent`;
            
            const response = await axios.post(url, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    key: this.apiKey
                }
            });

            if (response.data && response.data.candidates && response.data.candidates[0]) {
                return response.data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response from Gemini API');
            }

        } catch (error) {
            console.error('Gemini API调用失败:', error);
            throw error;
        }
    }

    /**
     * 解析营养分析响应
     */
    parseNutritionResponse(response, foodName) {
        try {
            // 尝试从响应中提取结构化数据
            const nutritionInfo = {
                food_name: foodName,
                analysis: response,
                extracted_data: this.extractNutritionData(response),
                timestamp: new Date().toISOString(),
                source: 'gemini_ai'
            };

            return nutritionInfo;

        } catch (error) {
            console.error('解析营养分析响应失败:', error);
            return {
                food_name: foodName,
                analysis: response,
                extracted_data: null,
                timestamp: new Date().toISOString(),
                source: 'gemini_ai',
                error: '解析失败'
            };
        }
    }

    /**
     * 从文本中提取营养数据
     */
    extractNutritionData(text) {
        try {
            const data = {};
            
            // 提取卡路里
            const calorieMatch = text.match(/(\d+)\s*卡路里|(\d+)\s*calories/i);
            if (calorieMatch) {
                data.calories = parseInt(calorieMatch[1] || calorieMatch[2]);
            }

            // 提取蛋白质
            const proteinMatch = text.match(/蛋白质[：:]\s*(\d+(?:\.\d+)?)\s*克|protein[：:]\s*(\d+(?:\.\d+)?)\s*g/i);
            if (proteinMatch) {
                data.protein = parseFloat(proteinMatch[1] || proteinMatch[2]);
            }

            // 提取碳水化合物
            const carbMatch = text.match(/碳水化合物[：:]\s*(\d+(?:\.\d+)?)\s*克|carbohydrate[：:]\s*(\d+(?:\.\d+)?)\s*g/i);
            if (carbMatch) {
                data.carbohydrates = parseFloat(carbMatch[1] || carbMatch[2]);
            }

            // 提取脂肪
            const fatMatch = text.match(/脂肪[：:]\s*(\d+(?:\.\d+)?)\s*克|fat[：:]\s*(\d+(?:\.\d+)?)\s*g/i);
            if (fatMatch) {
                data.fat = parseFloat(fatMatch[1] || fatMatch[2]);
            }

            return data;

        } catch (error) {
            console.error('提取营养数据失败:', error);
            return null;
        }
    }

    /**
     * 获取备用营养信息
     */
    getFallbackNutritionInfo(foodName) {
        const fallbackData = {
            'nasi_lemak': {
                food_name: 'Nasi Lemak',
                calories: 350,
                protein: 8.5,
                carbohydrates: 45.2,
                fat: 15.8,
                analysis: '椰浆饭是马来西亚的国菜，富含碳水化合物和椰浆，热量较高，适合早餐食用。',
                source: 'fallback_data'
            },
            'roti_canai': {
                food_name: 'Roti Canai',
                calories: 280,
                protein: 6.2,
                carbohydrates: 35.5,
                fat: 12.3,
                analysis: '印度煎饼是马来西亚常见的早餐，面粉制作，含有适量蛋白质和碳水化合物。',
                source: 'fallback_data'
            },
            'char_kway_teow': {
                food_name: 'Char Kway Teow',
                calories: 420,
                protein: 12.5,
                carbohydrates: 55.8,
                fat: 18.2,
                analysis: '炒粿条是马来西亚经典炒面，米粉制作，含有蛋白质和碳水化合物，热量适中。',
                source: 'fallback_data'
            },
            'bak_kut_teh': {
                food_name: 'Bak Kut Teh',
                calories: 380,
                protein: 25.8,
                carbohydrates: 8.5,
                fat: 22.3,
                analysis: '肉骨茶是马来西亚特色汤品，富含蛋白质，含有药材成分，营养丰富。',
                source: 'fallback_data'
            }
        };

        return fallbackData[foodName.toLowerCase()] || {
            food_name: foodName,
            calories: 300,
            protein: 10.0,
            carbohydrates: 40.0,
            fat: 15.0,
            analysis: `${foodName} 是马来西亚传统食物，营养均衡，建议适量食用。`,
            source: 'fallback_data'
        };
    }

    /**
     * 获取多个食物的备用营养信息
     */
    getFallbackMultipleNutritionInfo(foodNames) {
        const results = {};
        foodNames.forEach(foodName => {
            results[foodName] = this.getFallbackNutritionInfo(foodName);
        });
        return results;
    }

    /**
     * 缓存管理
     */
    getCachedResult(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedResult(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * 清理缓存
     */
    clearCache() {
        this.cache.clear();
        console.log('✅ 营养分析缓存已清理');
    }

    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return {
            cache_size: this.cache.size,
            cache_timeout: this.cacheTimeout,
            cached_keys: Array.from(this.cache.keys())
        };
    }

    /**
     * 测试API连接
     */
    async testConnection() {
        try {
            const testPrompt = '请简单介绍一下马来西亚食物';
            const response = await this.callGeminiAPI(testPrompt);
            return {
                success: true,
                message: 'Gemini AI连接正常',
                response_length: response.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new NutritionAnalysisService();
