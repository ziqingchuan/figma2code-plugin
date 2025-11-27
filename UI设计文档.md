# Figma 转 Vue3 代码插件 - UI 设计文档

## 1. UI 概览

### 1.1 设计理念
- **简洁高效**: 专注于核心功能，减少干扰
- **实时反馈**: 即时预览和代码生成
- **暗黑模式**: 适配 Figma 的暗黑主题
- **响应式**: 适应不同的插件窗口尺寸

### 1.2 UI 尺寸
```typescript
默认窗口尺寸: 450px × 700px
支持主题色: 是 (themeColors: true)
```

## 2. UI 结构

### 2.1 整体布局

```
┌─────────────────────────────────────────────┐
│              Figma 插件窗口                  │  450px × 700px
├─────────────────────────────────────────────┤
│  分隔线 (1px, rgba(255,255,255,0.12))       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │         预览区域 (Preview)             │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │ 预览标题                         │  │ │
│  │  ├─────────────────────────────────┤  │ │
│  │  │                                 │  │ │
│  │  │    设计预览 (320×180)            │  │ │
│  │  │                                 │  │ │
│  │  ├─────────────────────────────────┤  │ │
│  │  │ 尺寸信息                         │  │ │
│  │  └─────────────────────────────────┘  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │       代码面板 (CodePanel)             │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │ 复制按钮                         │  │ │
│  │  ├─────────────────────────────────┤  │ │
│  │  │                                 │  │ │
│  │  │    代码编辑器                    │  │ │
│  │  │    (语法高亮)                    │  │ │
│  │  │                                 │  │ │
│  │  │    ...                          │  │ │
│  │  ├─────────────────────────────────┤  │ │
│  │  │ 展开/收起按钮                    │  │ │
│  │  └─────────────────────────────────┘  │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### 2.2 状态视图

#### 2.2.1 加载状态 (Loading)
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              ┌─────────┐                    │
│              │  ⟳ 动画  │                    │
│              └─────────┘                    │
│                                             │
│           正在转换设计                       │
│                                             │
│    请稍候，正在将您的设计转换为代码。        │
│    复杂设计可能需要一些时间。                │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

#### 2.2.2 空状态 (Empty)
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              ┌─────────┐                    │
│              │  📄 图标 │                    │
│              └─────────┘                    │
│                                             │
│           请选择一个图层                     │
│                                             │
│    在 Figma 画布中选择一个图层或组件，       │
│    即可查看生成的代码。                      │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

#### 2.2.3 正常状态 (Normal)
显示预览和代码面板（如整体布局所示）

## 3. 组件设计

### 3.1 Preview 组件

#### 3.1.1 组件结构
```tsx
<div className="preview-container">
  {/* 头部 */}
  <div className="preview-header">
    <h3>预览</h3>
  </div>
  
  {/* 预览区域 */}
  <div className="preview-content">
    <div className="preview-frame">
      <div className="preview-inner" 
           dangerouslySetInnerHTML={{__html: content}} />
    </div>
  </div>
  
  {/* 底部信息 */}
  <div className="preview-footer">
    <span>{width}×{height}px</span>
  </div>
</div>
```

#### 3.1.2 样式特性
- **容器尺寸**: 320px × 180px (固定)
- **缩放策略**: 自动计算缩放比例以适应容器
- **边框**: 1px indigo-400/500 边框
- **背景**: 白色背景（暗黑模式下为深色）
- **阴影**: shadow-2xs

#### 3.1.3 缩放计算
```typescript
const scaleFactor = Math.min(
  containerWidth / htmlPreview.size.width,
  containerHeight / htmlPreview.size.height
);

const contentWidth = htmlPreview.size.width * scaleFactor + 2;
const contentHeight = htmlPreview.size.height * scaleFactor;
```

### 3.2 CodePanel 组件

#### 3.2.1 组件结构
```tsx
<div className="code-panel">
  {/* 头部 */}
  <div className="code-header">
    <p>代码</p>
    <CopyButton value={code} />
  </div>
  
  {/* 代码编辑器 */}
  <div className="code-editor">
    <SyntaxHighlighter
      language="html"
      style={tomorrow}
      customStyle={{...}}
    >
      {displayedCode}
    </SyntaxHighlighter>
    
    {/* 展开/收起按钮 */}
    {showMoreButton && (
      <button onClick={toggleExpand}>
        {isExpanded ? "收起" : "展开"}
      </button>
    )}
  </div>
</div>
```

#### 3.2.2 功能特性
- **语法高亮**: 使用 react-syntax-highlighter
- **主题**: tomorrow (暗黑主题)
- **字体大小**: 12px
- **初始显示**: 25 行
- **折叠功能**: 超过 25 行显示展开按钮
- **悬停效果**: 悬停时显示绿色边框 (ring-green-600)

#### 3.2.3 代码截断
```typescript
const truncateCode = (codeString: string, lines: number) => {
  const codeLines = codeString.split("\n");
  if (codeLines.length <= lines) {
    return codeString;
  }
  return codeLines.slice(0, lines).join("\n") + "\n...";
};
```

### 3.3 CopyButton 组件

#### 3.3.1 组件功能
- 复制代码到剪贴板
- 悬停时触发父组件高亮效果
- 点击后显示复制成功反馈

#### 3.3.2 交互流程
```
用户悬停 → onMouseEnter → 父组件高亮
用户点击 → copy(value) → 显示成功提示
用户离开 → onMouseLeave → 取消高亮
```

### 3.4 Loading 组件

#### 3.4.1 动画设计
```tsx
<div className="loading-spinner">
  {/* 外圈 - 静态 */}
  <div className="spinner-track" />
  
  {/* 内圈 - 旋转 */}
  <div className="spinner-active animate-spin" />
</div>
```

#### 3.4.2 样式特性
- **尺寸**: 64px × 64px (w-16 h-16)
- **颜色**: blue-500 (暗黑模式: blue-400)
- **动画**: 无限旋转 (animate-spin)
- **边框**: 4px 宽度
- **透明度**: 外圈 20-30% 透明度

### 3.5 EmptyState 组件

#### 3.5.1 组件结构
```tsx
<div className="empty-state">
  <div className="empty-icon">📄</div>
  <h3>请选择一个图层</h3>
  <p>在 Figma 画布中选择一个图层或组件，即可查看生成的代码。</p>
</div>
```

#### 3.5.2 样式特性
- **居中对齐**: flex + items-center + justify-center
- **文字颜色**: neutral-500/400 (暗黑模式)
- **图标大小**: 根据设计调整
- **间距**: 合理的垂直间距

## 4. 主题系统

### 4.1 颜色方案

#### 4.1.1 亮色模式
```css
背景色: #FFFFFF
文字色: #1B1B1B
边框色: #E5E5E5
代码背景: #1B1B1B
```

#### 4.1.2 暗黑模式
```css
背景色: #1B1B1B
文字色: #FFFFFF
边框色: rgba(255,255,255,0.12)
代码背景: #1B1B1B
```

### 4.2 主题检测
```typescript
const rootStyles = getComputedStyle(document.documentElement);
const figmaColorBgValue = rootStyles
  .getPropertyValue("--figma-color-bg")
  .trim();

const darkMode = figmaColorBgValue !== "#ffffff";
```

### 4.3 主题应用
```tsx
<div className={`${darkMode ? "dark" : ""}`}>
  <PluginUI {...props} />
</div>
```

## 5. 交互设计

### 5.1 用户操作流程

#### 5.1.1 基本流程
```
1. 用户打开插件
   ↓
2. 显示空状态或上次结果
   ↓
3. 用户在 Figma 中选择节点
   ↓
4. 显示加载动画
   ↓
5. 转换完成，显示预览和代码
   ↓
6. 用户可以:
   - 查看预览
   - 复制代码
   - 展开/收起代码
   - 选择其他节点
```

#### 5.1.2 复制代码流程
```
用户悬停复制按钮
   ↓
代码编辑器显示绿色边框
   ↓
用户点击复制按钮
   ↓
代码复制到剪贴板
   ↓
显示复制成功提示
   ↓
用户离开按钮
   ↓
取消绿色边框
```

### 5.2 响应式行为

#### 5.2.1 预览缩放
- 自动计算缩放比例
- 保持宽高比
- 居中显示
- 平滑过渡 (transition: 0.3s ease)

#### 5.2.2 代码面板
- 初始显示 25 行
- 超过 25 行显示展开按钮
- 展开后显示全部代码
- 收起后恢复 25 行

### 5.3 加载状态

#### 5.3.1 触发条件
```typescript
// 开始转换
setState({ isLoading: true, code: "" });

// 转换完成
setState({ isLoading: false, code: result });
```

#### 5.3.2 加载动画
- 旋转动画 (animate-spin)
- 淡入效果 (animate-fadeIn)
- 提示文字

## 6. 性能优化

### 6.1 代码面板优化

#### 6.1.1 Memoization
```typescript
const lineCount = useMemo(
  () => prefixedCode.split("\n").length,
  [prefixedCode]
);
```

#### 6.1.2 延迟渲染
- 初始只渲染 25 行
- 用户点击展开后才渲染全部
- 避免大文件导致卡顿

### 6.2 预览优化

#### 6.2.1 图片占位符替换
```typescript
const replacePlaceholderImages = (html: string) => {
  // 替换占位符图片为实际图片
  return html.replace(/placeholder-url/g, actualUrl);
};
```

#### 6.2.2 缩放优化
- 使用 CSS zoom 属性
- 避免重新渲染
- 平滑过渡动画

## 7. 可访问性

### 7.1 语义化 HTML
- 使用正确的 HTML 标签
- 提供 aria-label 属性
- 支持键盘导航

### 7.2 对比度
- 文字与背景对比度符合 WCAG AA 标准
- 按钮和链接有明显的视觉反馈

### 7.3 提示信息
- 加载状态有明确的文字说明
- 空状态有引导性文字
- 错误信息清晰易懂

## 8. 错误处理

### 8.1 错误显示
```typescript
// 错误状态
setState({
  code: `错误 :(\n// ${errorMessage}`,
  isLoading: false
});
```

### 8.2 错误类型
- 转换错误: 显示错误信息
- 网络错误: 显示网络错误提示
- 未知错误: 显示通用错误信息

## 9. 样式系统

### 9.1 Tailwind CSS 配置
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        card: 'var(--card)',
        border: 'var(--border)',
        muted: {
          foreground: 'var(--muted-foreground)'
        }
      }
    }
  }
}
```

### 9.2 自定义样式
```css
/* 代码编辑器悬停效果 */
.code-editor:hover {
  ring: 2px solid rgb(22 163 74); /* green-600 */
}

/* 预览边框 */
.preview-frame {
  border: 1px solid rgb(129 140 248); /* indigo-400 */
}

/* 加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 10. 组件 Props 接口

### 10.1 PluginUI Props
```typescript
interface PluginUIProps {
  code: string;              // 生成的代码
  htmlPreview: HTMLPreview;  // HTML 预览
  isLoading: boolean;        // 加载状态
}
```

### 10.2 Preview Props
```typescript
interface PreviewProps {
  htmlPreview: HTMLPreview;  // 预览内容
}

interface HTMLPreview {
  size: { width: number; height: number };
  content: string;
}
```

### 10.3 CodePanel Props
```typescript
interface CodePanelProps {
  code: string;  // 代码内容
}
```

### 10.4 CopyButton Props
```typescript
interface CopyButtonProps {
  value: string;                    // 要复制的内容
  onMouseEnter?: () => void;        // 鼠标进入事件
  onMouseLeave?: () => void;        // 鼠标离开事件
}
```

## 11. 未来 UI 改进

### 11.1 功能增强
- [ ] 设置面板（显示/隐藏图层名称等）
- [ ] 多标签页（HTML、CSS、预览）
- [ ] 代码格式化选项
- [ ] 导出选项（下载文件）
- [ ] 历史记录

### 11.2 视觉优化
- [ ] 更丰富的动画效果
- [ ] 自定义主题色
- [ ] 更好的错误提示样式
- [ ] 加载进度条

### 11.3 交互改进
- [ ] 拖拽调整预览大小
- [ ] 代码搜索功能
- [ ] 快捷键支持
- [ ] 代码差异对比
