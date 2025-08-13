# 二维码生成后端服务使用说明

## 概述

本项目采用Python后端 + JavaScript前端的架构来生成支持中文的二维码，解决了前端JavaScript库在中文字符处理上的兼容性问题。

## 技术栈

- **后端**: Python Flask + segno库
- **前端**: JavaScript fetch API
- **二维码库**: segno (Python)

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 启动后端服务

```bash
python qr_generator.py
```

服务将在 `http://localhost:5000` 启动

### 3. 启动前端服务

```bash
python -m http.server 8000
```

前端将在 `http://localhost:8000` 可访问

## API 接口

### 生成二维码

**接口**: `POST /generate_qr`

**请求体**:
```json
{
    "text": "要生成二维码的文本内容",
    "size": 8,
    "border": 4
}
```

**响应**:
```json
{
    "success": true,
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "message": "二维码生成成功"
}
```

### 健康检查

**接口**: `GET /health`

**响应**:
```json
{
    "status": "ok",
    "message": "二维码服务运行正常"
}
```

## 功能特点

1. **完美支持中文**: 使用segno库原生支持UTF-8编码
2. **标准兼容**: 生成的二维码符合国际标准，微信等扫描器完美兼容
3. **高可靠性**: 后端处理比前端JavaScript库更稳定
4. **易于扩展**: 可以轻松添加更多二维码生成选项

## 故障排除

### 常见问题

1. **端口冲突**: 如果5000端口被占用，修改 `qr_generator.py` 中的端口号
2. **跨域问题**: 已配置CORS，支持跨域请求
3. **依赖安装失败**: 确保Python版本 >= 3.7

### 调试模式

后端服务默认开启调试模式，可以在控制台查看详细日志。

## 项目结构

```
.
├── qr_generator.py          # Python后端服务
├── requirements.txt         # Python依赖
├── script.js               # 前端JavaScript代码
├── index.html              # 前端页面
└── 二维码乱码问题解决记录.md  # 问题解决记录
```

## 更新日志

- **v1.0**: 初始版本，实现基本的二维码生成功能
- **v1.1**: 添加中文支持，使用segno库
- **v1.2**: 完善错误处理和日志记录