```
# 666OS YAML 生成器
一个基于 Cloudflare Workers 的在线工具，快速生成适配 Mihomo (Clash Meta) 的配置文件。
输入订阅链接，即可生成带有 Lite / Pro 规则集的 YAML，支持一键复制或下载。

---

## ✨ 功能特性
- 提供 **Lite** / **Pro** 两套配置版本
- 自动为订阅链接追加 `flag=meta` 参数
- 实时拉取上游仓库最新模板，内置边缘缓存与降级兜底机制
- 纯前端界面，深色主题，响应式布局
- 一键复制 YAML 内容 / 下载 `.yaml` 文件
- Serverless 架构，部署在 Cloudflare Workers，免费、访问速度快

---

## 🚀 在线使用
如果你已经部署 Worker，直接访问分配的 `*.workers.dev` 域名。
未部署请参考下方「部署到 Cloudflare Workers」章节。

---

## 🛠️ 部署到 Cloudflare Workers
### 方式一：Cloudflare 控制台部署（推荐）
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **创建应用程序** → **创建 Worker**
3. 设置 Worker 名称（例如 `yaml-generator`），点击部署
4. 点击 **编辑代码**，粘贴项目内 `worker.js` 的全部代码
5. 保存并部署
6. 访问 `https://<你的Worker名称>.workers.dev`

> 提示：本 Worker 使用 ES Module 语法 `export default { async fetch... }`，Cloudflare 默认支持，无需额外配置。

### 方式二：Wrangler CLI 部署
```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

在项目目录新建 `wrangler.toml`：

```
name = "yaml-generator"
main = "worker.js"
compatibility_date = "2024-01-01"
```

```
# 执行部署
wrangler deploy
```

---

## 📖 使用教程

1. 打开部署完成的 Worker 页面
2. 在输入框粘贴你的订阅链接
3. 选择配置版本
   - **Lite**：轻量版本，大多数场景推荐使用
   - **Pro**：完整版本，包含广告拦截与更多策略组
4. 点击 **生成 YAML**
5. 生成完成后可选操作：
   - 点击 **复制 YAML**，复制配置到剪贴板
   - 点击 **下载 YAML**，保存 `.yaml` 文件
6. 将 YAML 文件导入 Mihomo / Clash Meta 客户端即可

---

## 🔄 模板来源与更新机制

配置模板来自开源仓库：[https://github.com/666OS/YYDS](https://github.com/666OS/YYDS)

- Lite 模板：[https://raw.githubusercontent.com/666OS/YYDS/main/mihomo/config/cn/Lite_cn.yaml](https://raw.githubusercontent.com/666OS/YYDS/main/mihomo/config/cn/Lite_cn.yaml)
- Pro 模板：[https://raw.githubusercontent.com/666OS/YYDS/main/mihomo/config/cn/Pro_cn.yaml](https://raw.githubusercontent.com/666OS/YYDS/main/mihomo/config/cn/Pro_cn.yaml)

每次请求会动态获取上游最新 YAML。依靠 Cloudflare 边缘缓存（`cacheTtl: 3600`，1 小时）减少对 GitHub 请求。
当上游拉取失败（网络超时、GitHub 无法访问）时，自动切换内置默认模板，保证服务可用。

---

## ⚠️ 注意事项

- 请确认订阅链接有效，且支持 Meta 格式
- 生成配置仅供个人学习使用，请遵守当地法律法规
- 上游模板结构可能变更，若订阅替换失效，请修改 `worker.js` 中的正则表达式
- 工具**不会存储任何订阅链接与生成内容**，全部处理仅在 Worker 内存中完成

---

## 🙏 致谢

- 模板作者：[https://github.com/666OS](https://github.com/666OS)
- 图标来源：[https://github.com/Koolson/Qure](https://github.com/Koolson/Qure)
- 规则集：[https://github.com/666OS/rules](https://github.com/666OS/rules)
- 运行平台：[https://workers.cloudflare.com/](https://workers.cloudflare.com/)

---

## 📄 许可协议

MIT License
