# YAML 订阅转换服务

一个基于 Cloudflare Workers 的轻量级在线订阅转换工具，专为 Mihomo (Clash Meta) 打造。

无需依赖第三方订阅转换服务器，由 Cloudflare Worker 后端**直接拉取并解析机场订阅**，消除客户端拉取失败与节点泄露风险。支持在前端网页预览生成 YAML，也可以**直接将生成的专属订阅 URL 粘贴到 Clash / Mihomo 客户端中实现自动更新**。

---

## ✨ 功能特性

- **后端抓取与解析**：服务端使用通用 Clash/Meta 标识拉取订阅，支持自动识别 Base64 及 YAML 节点格式。
- **垃圾节点过滤**：自动识别并过滤机场公告、官网、客服、到期流量提醒等无用节点。
- **生成专属客户端订阅 URL**：直接提供可导入 Clash / Mihomo / ShellClash 等客户端的通用订阅链接，随时随地自动刷新。
- **自定义访问 Key / 密码**：支持给专属订阅链接添加自定义秘钥参数，增强私密性与安全防爆破。
- **内置完整硬编码配置**：包含丰富策略组（即时通讯、社交平台、人工智能、开发服务等）、分流规则与 `.mrs` 二进制规则集。
- ** Telegram 专属优化**：置顶 Telegram 域名与 IP 分流规则，移除 IP 匹配时的 `no-resolve` 限制，解决连接卡顿与“连接中”问题。
- **多版本配置支持**：支持 `Lite` 与 `Pro` 不同规则配置模板选择。
- ** Serverless 架构**：零成本部署在 Cloudflare Workers，单文件部署，极速响应。

---

## 🚀 在线使用

如果你已经部署 Worker，直接访问分配的 `*.workers.dev` 域名或自定义域名。

1. 打开 Worker 部署的网页界面。
2. 粘贴你的机场通用 / Clash 订阅链接。
3. （可选）设置自定义访问密码 Key（例如 `mysecret123`），增加链接隐蔽性。
4. 选择配置版本（`Lite` / `Pro`）。
5. 点击 **生成通用订阅链接**，复制获得的专属 URL。
6. 将 URL 粘贴至 Clash / Mihomo 客户端的订阅栏内更新即可。

---

## 🛠️ 部署到 Cloudflare Workers

### 方式一：Cloudflare 控制台部署（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 进入 **Workers & Pages** → **创建应用程序** → **创建 Worker**。
3. 输入 Worker 名称（例如 `subconverter`），点击部署。
4. 点击 **编辑代码**，复制 `666OS转换终版.js` 的全部内容并粘贴覆盖编辑器内代码。
5. 点击 **保存并部署**（Save and deploy）。
6. 访问 `https://<你的Worker名称>.workers.dev` 即可开始使用。

### 方式二：Wrangler CLI 部署

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare 账号
wrangler login

```

在项目根目录下新建 `wrangler.toml` 文件：

```toml
name = "subconverter"
main = "666OS转换终版.js"
compatibility_date = "2024-01-01"

```

运行部署命令：

```bash
wrangler deploy

```

---

## 📡 API / 订阅接口说明

你可以直接通过 HTTP 请求获取转换后的配置文件：

```http
GET /sub?url=<BASE64_ENCODED_SUB_URL>&version=lite&key=<YOUR_KEY>

```

| 参数 | 必填 | 描述 |
| --- | --- | --- |
| `url` | **是** | 经过 **Base64 编码** 的原始机场订阅链接 |
| `version` | 否 | 配置版本，可选 `lite`（默认）或 `pro` |
| `key` | 否 | 自定义验证秘钥/密码 |

**示例订阅链接：**

```text
[https://your-worker.workers.dev/sub?url=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdWI=&version=lite&key=123456](https://your-worker.workers.dev/sub?url=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdWI=&version=lite&key=123456)

```

---

## ⚠️ 注意事项

* 请确保你的客户端（如 Mihomo / Clash Meta）支持规则集（`rule-providers`）及 `.mrs` 二进制格式。
* 自定义 Key 仅作用于 API 订阅 URL 路由防越权访问，前端网页生成无需校验 Key。
* 本工具为**纯内存处理**，Worker 节点不会将你的机场订阅信息持久化存储到任何数据库，请放心使用。
* 仅供个人学习与网络优化使用，请遵守当地法律法规。

---

## 🙏 致谢与来源

* 规则集来源：[666OS Rules](https://www.google.com/search?q=https://github.com/666OS/rules&utm_source=gemini)
* 图标库来源：[Qure Color IconSet](https://github.com/Koolson/Qure?utm_source=gemini)
* 运行平台：[Cloudflare Workers](https://workers.cloudflare.com/?utm_source=gemini)

---

## 📄 许可协议

[MIT License](https://www.google.com/search?q=LICENSE&utm_source=gemini)

```

```
