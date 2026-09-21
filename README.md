YAML 订阅转换服务

一个基于 Cloudflare Workers 的轻量级在线订阅转换工具，专为 Mihomo (Clash Meta) 打造。

在传统 YAML 生成的基础上，新增了**全量节点自动测速选优**策略，并支持生成**专属客户端订阅链接**，方便直接粘贴到 Clash / Mihomo / ShellClash 等客户端内实现自动同步更新。

---

## ✨ 功能特性

- **全节点自动选择（新功能）**：新增「自动选择」策略组，自动对订阅中的全部节点进行 HTTP 测速，并动态切换至延迟最低的节点。
- **客户端一键自动更新**：新增 `/sub` API 接口，可生成专属订阅 URL 直接填入客户端，无需每次手动下载 YAML。
- **动态替换与参数补全**：自动为订阅追加 `flag=meta` 参数，适配更多机场格式。
- **无用节点过滤**：内置过滤正则，自动排除机场公告、官网、到期提醒、流量卡等干扰节点。
- **多版本配置支持**：
  - **Lite**：轻量推荐，包含自动选择、故障转移及各地区策略。
  - **Pro**：完整版本，额外包含广告拦截（`REJECT`）与多地区负载均衡（`load-balance`）。
- **优化规则集与图标**：使用 `.mrs` 二进制规则集与 Qure 统一图标，加载速度快。
- ** Serverless 架构**：部署在 Cloudflare Workers，免费、免服务器维保、极速响应。

---

## 🚀 在线使用

如果你已经部署 Worker，直接访问分配的 `*.workers.dev` 域名。

1. 打开 Worker 部署的网页界面。
2. 粘贴你的机场 / 节点订阅链接。
3. 选择配置版本（`Lite` / `Pro`）。
4. 点击 **生成 YAML**：
   - **方式 A（推荐）**：复制获得的 **专属客户端一键订阅链接**，直接粘贴至 Clash / Mihomo 客户端的订阅/配置管理中。
   - **方式 B**：直接点击 **一键复制 YAML 文本** 或 **下载 YAML 文件** 进行导入。

---

## 🛠️ 部署到 Cloudflare Workers

### 方式一：Cloudflare 控制台部署（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 进入 **Workers & Pages** → **创建应用程序** → **创建 Worker**。
3. 设置 Worker 名称（例如 `yaml-generator`），点击部署。
4. 点击 **编辑代码**，将 `666OS转换终版.js` 的全部内容粘贴覆盖编辑器代码。
5. 点击 **保存并部署**。
6. 访问 `https://<你的Worker名称>.workers.dev` 即可使用。

### 方式二：Wrangler CLI 部署

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare 账号
wrangler login

```

在项目根目录下新建 `wrangler.toml` 文件：

```toml
name = "yaml-generator"
main = "666OS转换终版.js"
compatibility_date = "2024-01-01"

```

运行部署命令：

```bash
wrangler deploy

```

---

## 📡 订阅 API 接口说明

你可以直接通过 HTTP 请求获取转换后的 YAML 配置文件：

```http
GET /sub?url=<BASE64_ENCODED_SUB_URL>&version=lite

```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `url` | **是** | 经过 Base64 编码（或原始 URL Encode）的机场订阅链接 |
| `version` | 否 | 配置版本，可选 `lite`（默认）或 `pro` |

**示例订阅链接：**

```text
[https://your-worker.workers.dev/sub?url=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdWI=&version=lite](https://your-worker.workers.dev/sub?url=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdWI=&version=lite)

```

---

## ⚠️ 注意事项

* 请确认你的客户端（如 Mihomo / Clash Meta）支持 `.mrs` 格式规则集与 `rule-providers`。
* 本工具采用**纯内存实时转换**，不会持久化存储或记录任何用户的订阅链接，请放心使用。
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
