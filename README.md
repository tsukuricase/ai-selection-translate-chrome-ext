当然可以！以下是一份适合你项目结构的 `README.md` 模板。你可以根据实际API使用和项目细节补充或调整内容。

---

# AI Selection Translate Chrome Extension

基于现代大模型（OpenRouter/DeepSeek/Qwen）服务的浏览器划词AI翻译插件。  
选中网页文本，智能调用所选API进行翻译，并展示译文弹窗，助力高效阅读与学习。

---

## 🚀 功能特点

- **一划即译**：网页中选中文本后自动弹窗翻译
- **支持多种AI服务**：可自由切换 OpenRouter、DeepSeek、Qwen 等 API
- **自定义API KEY**：KEY 本地安全存储，不上传第三方
- **简洁UI**：代码结构清晰，弹窗非侵入
- **轻量易扩展**：便于按需增添服务商、调整界面

---

## 📂 目录结构

```
ai-selection-translate-chrome-ext/
├── manifest.json           // 插件配置
├── content.js              // 注入前台脚本
├── background.js           // 后端 API 调用及消息转发
├── options.html            // 设置页面
├── options.js              // 设置页脚本
├── icons/                  // 插件图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── styles/
│   └── popover.css         // 弹窗样式
└── README.md               // 插件说明文档
```

---

## 🛠️ 安装和使用

1. **下载代码到本地文件夹**
2. 打开 Chrome，进入 `chrome://extensions/`
3. 打开“开发者模式”
4. 点击“加载已解压的扩展程序”，选择本项目根目录
5. 安装后，点击扩展图标 → “扩展选项”进行 API Key 和服务类型设置

---

## ⚙️ API Key 设置

1. 访问插件“选项页”（`chrome-extension://<id>/options.html` 或点击扩展icon设置）
2. 选择服务商（OpenRouter/DeepSeek/Qwen）
3. 输入你的对应AI服务的API KEY，并保存

> **请妥善保管API KEY，避免泄露。KEY仅本地浏览器存储，不会上传。**

---

## 💡 使用方法

1. 在任意网页选中一段英文或其他语言文字
2. 松开鼠标后，将自动弹出译文窗口
3. 可点击弹窗内关闭按钮关闭结果展示

---

## 🌐 支持的AI服务

- [OpenRouter](https://openrouter.ai/)
- [DeepSeek](https://deepseek.com/)  
- [Qwen (阿里千问)](https://dashscope.aliyun.com/)  
> 你需自行注册相关服务账号并获取 API Key。  
> 如需支持其它服务，请补充 `background.js` 内的 API 适配。

---

## 📝 开发与自定义

- 如需改动弹窗样式，请编辑 `styles/popover.css` 或相应JS样式
- 如需添加 AI 平台，请在 `background.js` 补充对应API请求逻辑，并在 `options.html` 增加选择项
- 项目基于 manifest V3，内容脚本/后台脚本交互采用 Chrome message 机制

---

## ❓ 常见问题

- **Q: 怎么获取 OpenRouter/DeepSeek/Qwen 的 API Key？**  
  A: 见各自官网注册与开发者中心申请。API Key 只需填写一次即可。

- **Q: 翻译不出来？**
  - 检查 API Key 是否正确，有无服务商额度
  - 网络环境是否可正常访问外部API
  - 控制台（F12）查看 background 脚本有无报错

- **Q: 能否支持多语言翻译？**  
  A: 可以！默认示例 prompt 为自动检测到中文，可自定义 background.js 的 system prompt。

---

## 📢 免责声明

本插件仅供学习和个人用途，API Key 和使用额度由用户个人负责。请遵守各AI服务相关条款。

---

## 🙏 感谢

感谢 OpenRouter、DeepSeek、Qwen 等大模型开放 API。  
插件UI代码灵感来自各类划词工具与简易翻译插件，但大模型能力带来全新体验。

---

有建议欢迎提 Issues 或 PR ~