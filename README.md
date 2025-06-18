# VDpointCloud

**VDpointCloud** - 基于 PotreeJS 的专业点云可视化解决方案，专注于点云可视化核心功能的高性能 WebGL 点云查看器。

## 功能特点

- 支持大规模点云数据加载和渲染
- 基于 WebGL 的高性能 3D 可视化
- 支持 LAS/LAZ 格式点云文件
- 八叉树（Octree）优化的点云组织结构
- 响应式设计，支持多种设备访问
- 可嵌入到现有 Web 应用中

## 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 支持 WebGL 的现代浏览器

## 安装

### 1. 克隆项目

```bash
git clone <repository-url>
cd VDpointCloud
```

### 2. 安装依赖

```bash
npm install
```

### 3. 构建项目

```bash
npm run build
```

## 使用方式

### 开发模式

启动开发服务器（支持热重载）：

```bash
npm start
# 或
npm run dev
```

服务器将运行在 `http://localhost:1235`

### 生产构建

构建生产版本：

```bash
npm run build:prod
```

### 可用命令

- `npm start` - 启动开发服务器
- `npm run dev` - 启动开发服务器（同 start）
- `npm run build` - 构建项目
- `npm run build:prod` - 构建生产版本
- `npm run clean` - 清理构建文件
- `npm run serve` - 启动静态文件服务器

## 项目结构

```
VDpointCloud/
├── src/                    # 源代码
│   ├── viewer/            # 查看器相关代码
│   ├── modules/           # 功能模块
│   ├── materials/         # 材质和着色器
│   ├── loader/            # 点云加载器
│   └── utils/             # 工具函数
├── build/                 # 构建输出
│   └── potree/           # 构建后的库文件
├── examples/              # 示例文件
├── resources/             # 资源文件
│   ├── icons/            # 图标
│   └── textures/         # 纹理文件
├── types/                 # TypeScript 类型定义
└── docs/                  # 文档
```

## 快速开始

1. 启动开发服务器：
   ```bash
   npm start
   ```

2. 打开浏览器访问：
   ```
   http://localhost:1235
   ```

3. 查看示例：
   ```
   http://localhost:1235/examples/ca13.html
   ```

## 部署

### 部署到 Web 服务器

1. 执行生产构建：
   ```bash
   npm run build:prod
   ```

2. 将以下文件和目录上传到 Web 服务器：
   - `build/` 目录
   - `examples/` 目录（如果需要）
   - `resources/` 目录
   - 你的 HTML 文件

3. 不需要在服务器上安装 Node.js，只需要提供静态文件服务即可。

### 嵌入到现有项目

在 HTML 文件中引入构建后的库：

```html
<!DOCTYPE html>
<html>
<head>
    <title>VDpointCloud Viewer</title>
    <link rel="stylesheet" type="text/css" href="build/potree/potree.css">
</head>
<body>
    <div id="potree_container" style="position: absolute; width: 100%; height: 100%;"></div>
    
    <script src="build/potree/potree.js"></script>
    <script>
        // 初始化 VDpointCloud 查看器
        // 详细使用方法请参考 examples 目录
    </script>
</body>
</html>
```

## 点云格式转换

使用 [PotreeConverter](https://github.com/potree/PotreeConverter) 将点云数据转换为 Potree 格式：

```bash
./PotreeConverter.exe your_pointcloud.las -o converted_pointcloud
```

转换后将输出目录复制到项目中使用。

## 许可证

本项目基于 BSD-2-Clause 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 支持的浏览器

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

推荐使用最新版本的现代浏览器以获得最佳性能。
