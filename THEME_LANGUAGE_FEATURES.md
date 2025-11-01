# 主题和语言切换功能说明

## 🎨 主题切换功能

### 支持的主题

1. **深色主题** (默认)
   - 黑色背景 (`#0f0f0f` → `#1a1a1a`)
   - 白色/浅色文字
   - 现代科技感设计

2. **浅色主题**
   - 浅灰背景 (`#f5f7fa` → `#e8edf5`)
   - 深色文字 (`#1a1a1a`)
   - 清爽简洁设计

### 使用方法

1. 进入"设置"标签页
2. 在"主题模式"下拉框中选择主题
3. 主题会**立即生效**，无需刷新
4. 设置会**自动保存**到浏览器本地存储

### 技术实现

- 使用 `localStorage` 持久化存储
- CSS 类切换实现主题变换
- 平滑过渡动画

---

## 🌐 语言切换功能

### 支持的语言

1. **中文简体** (默认)
2. **English**

### 翻译内容

自动翻译以下界面元素：
- 页面标题
- 导航标签（仪表盘/模型训练等）
- 设置相关文本
- 按钮文本

### 使用方法

1. 进入"设置"标签页
2. 在"语言"下拉框中选择语言
3. 界面会**立即切换**语言
4. 设置会**自动保存**到浏览器本地存储
5. 刷新页面后语言设置自动恢复

### 技术实现

- 使用 `translations` 对象存储翻译文本
- 动态更新 DOM 元素文本
- 保留 emoji 图标
- `localStorage` 持久化

---

## 💾 数据存储

### 存储方式

使用浏览器的 `localStorage` API：
- `nutriscan-theme`: 保存主题设置
- `nutriscan-language`: 保存语言设置

### 持久化特性

- ✅ 设置会永久保存
- ✅ 刷新页面后自动恢复
- ✅ 不会因关闭浏览器而丢失
- ✅ 清除浏览器缓存才会删除

---

## 🎯 用户体验

### 即时生效

- **无需刷新页面**：主题和语言切换立即生效
- **无需保存按钮**：选择后自动保存（但保留了保存按钮以提示用户）
- **自动恢复**：下次打开页面时自动应用之前的设置

### 视觉反馈

- 平滑的 CSS 过渡动画
- 成功的通知提示
- 界面状态实时更新

---

## 📝 代码说明

### 主要函数

```javascript
applyTheme(theme)        // 应用主题
applyLanguage(lang)      // 应用语言
saveSettings()          // 保存设置
loadSettings()          // 加载保存的设置
```

### 事件监听

```javascript
// 主题切换
themeSelector.addEventListener('change', function() {
    applyTheme(this.value);
    localStorage.setItem('nutriscan-theme', this.value);
});

// 语言切换
languageSelector.addEventListener('change', function() {
    applyLanguage(this.value);
    localStorage.setItem('nutriscan-language', this.value);
});
```

---

## 🔧 扩展说明

### 添加新主题

1. 在 CSS 中添加新的主题样式：
```css
body.new-theme {
    /* 新主题样式 */
}
```

2. 在 HTML 的 select 中添加选项：
```html
<option value="new-theme">新主题名称</option>
```

3. 在 `applyTheme` 函数中添加逻辑

### 添加新语言

1. 在 `translations` 对象中添加翻译：
```javascript
const translations = {
    'en': { /* ... */ },
    'new-lang': {
        title: '翻译标题',
        dashboard: '翻译文本',
        // ...
    }
};
```

2. 在 HTML 的 select 中添加选项：
```html
<option value="new-lang">新语言名称</option>
```

---

## 🐛 故障排除

### 设置没有保存

- 检查浏览器是否支持 `localStorage`
- 检查是否在隐私模式下（某些浏览器会限制）
- 尝试清除 localStorage 后重新设置

### 主题没有生效

- 检查 CSS 类是否正确添加
- 查看浏览器控制台是否有错误
- 尝试硬刷新页面 (Ctrl+F5)

### 语言切换不完整

- 某些内容可能需要手动添加到 `translations` 对象
- 检查文本替换逻辑是否正确
- 查看控制台错误信息

---

## 📊 兼容性

### 浏览器支持

- ✅ Chrome 4+
- ✅ Firefox 3.5+
- ✅ Safari 4+
- ✅ Edge 12+
- ✅ Opera 10.5+

### 依赖

- 纯 JavaScript (Vanilla JS)
- 无需 jQuery 或其他库
- 使用原生浏览器 API

---

**创建日期**: 2025-11-01  
**版本**: 1.0.0

