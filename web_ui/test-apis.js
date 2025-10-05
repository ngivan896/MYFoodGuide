// 测试API连接的脚本
const axios = require('axios');

async function testRoboflowAPI() {
    console.log('🔗 测试Roboflow API连接...');
    
    try {
        // 使用Roboflow的正确API端点
        const response = await axios.get('https://api.roboflow.com/', {
            headers: {
                'Authorization': 'Bearer BwTemPbP39LHLFH4teds'
            }
        });
        
        console.log('✅ Roboflow API连接成功！');
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.log('❌ Roboflow API连接失败:', error.message);
        if (error.response) {
            console.log('错误详情:', error.response.data);
        }
        return false;
    }
}

async function testGeminiAPI() {
    console.log('🔗 测试Gemini API连接...');
    
    try {
        // 使用完整的Gemini API密钥
        const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
            params: {
                key: 'AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8'
            }
        });
        
        console.log('✅ Gemini API连接成功！');
        console.log('可用模型数量:', response.data.models?.length || 0);
        return true;
    } catch (error) {
        console.log('❌ Gemini API连接失败:', error.message);
        if (error.response) {
            console.log('错误详情:', error.response.data);
        }
        return false;
    }
}

async function main() {
    console.log('🚀 开始测试API连接...\n');
    
    const roboflowSuccess = await testRoboflowAPI();
    console.log('\n');
    const geminiSuccess = await testGeminiAPI();
    
    console.log('\n📊 测试结果总结:');
    console.log(`Roboflow API: ${roboflowSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`Gemini API: ${geminiSuccess ? '✅ 成功' : '❌ 失败'}`);
    
    if (roboflowSuccess && geminiSuccess) {
        console.log('\n🎉 所有API连接成功！系统现在可以使用真实数据了！');
    } else {
        console.log('\n⚠️ 部分API连接失败，系统将使用模拟数据。');
    }
}

main().catch(console.error);
