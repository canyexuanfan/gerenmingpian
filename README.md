# 个人社交名片生成器

一个纯静态的个人名片生成站点，可直接部署到 Vercel。

## 当前形态

- 前端纯静态，无需 Python/Flask 后端
- 浏览器端直接生成分享二维码和 `MECARD` 名片二维码
- 支持 PNG 名片导出
- 支持生成带查询参数的分享链接
- 已适配 Vercel 静态部署

## 主要文件

- `index.html`：页面结构
- `script.js`：交互逻辑与二维码生成
- `qrcode-modern.bundle.js`：浏览器端二维码库
- `favicon.ico` / `favicon.png` / `apple-touch-icon.png`：站点图标

## 本地预览

```bash
python -m http.server 9999
```

然后访问 [http://localhost:9999](http://localhost:9999)。

## 部署

已支持直接使用 Vercel CLI 从仓库根目录部署：

```bash
vercel --prod
```

## 说明

- 仓库中不再依赖旧的二维码后端接口
- 若要验证中文扫码兼容性，建议优先用微信实机扫码测试
