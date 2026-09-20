export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ========== 功能 1：处理 Web 端的生成请求 ==========
    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        let subUrl = formData.get('subUrl')?.trim();
        const version = formData.get('version') || 'lite';

        if (!subUrl) {
          return new Response(JSON.stringify({ error: '请输入订阅链接' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const fetchedProxies = await fetchAndParseSub(subUrl);

        if (!fetchedProxies || fetchedProxies.length === 0) {
          return new Response(JSON.stringify({ error: '未能从订阅中解析出任何有效节点，请确认订阅链接是否正确' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const yamlResult = buildFinalYaml(version, fetchedProxies);

        return new Response(JSON.stringify({ yaml: yamlResult, nodeCount: fetchedProxies.length }), {
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || '生成失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // ========== 功能 2：处理客户端的 API 订阅请求（URL + 密码访问） ==========
    // 匹配路径格式：/sub?url=Base64编码的机场链接&version=lite&key=你的密码
    if (url.pathname === '/sub') {
      const key = url.searchParams.get('key');
      const version = url.searchParams.get('version') || 'lite';
      const encodedSubUrl = url.searchParams.get('url');

      if (!encodedSubUrl) {
        return new Response('错误: 缺少 url 参数', { status: 400 });
      }

      let subUrl = '';
      try {
        // 解码 Base64 格式的机场订阅 URL
        subUrl = atob(decodeURIComponent(encodedSubUrl));
      } catch (e) {
        return new Response('错误: url 参数 Base64 解析失败', { status: 400 });
      }

      try {
        const fetchedProxies = await fetchAndParseSub(subUrl);

        if (!fetchedProxies || fetchedProxies.length === 0) {
          return new Response('错误: 未能从机场订阅中解析出有效节点', { status: 500 });
        }

        const yamlResult = buildFinalYaml(version, fetchedProxies);

        // 返回标准配置文件响应（设置下载文件名与 Clash 请求头识别）
        return new Response(yamlResult, {
          status: 200,
          headers: {
            'Content-Type': 'text/yaml; charset=utf-8',
            'Content-Disposition': `attachment; filename="666OS-${version}.yaml"`,
            'Subscription-Userinfo': 'upload=0; download=0; total=1073741824000; expire=0'
          }
        });
      } catch (err) {
        return new Response(`拉取失败: ${err.message}`, { status: 500 });
      }
    }

    // ========== 默认：渲染 Web 前端控制台 ==========
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

// ==================== 后端：抓取并解析订阅 ====================
async function fetchAndParseSub(subUrl) {
  const reqHeaders = {
    'User-Agent': 'ClashMeta/1.18.0 Mihomo/1.18.0 clash',
    'Accept': '*/*'
  };

  const subResp = await fetch(subUrl, { headers: reqHeaders, redirect: 'follow' });
  if (!subResp.ok) {
    throw new Error(`机场返回 HTTP ${subResp.status}`);
  }

  const rawSubData = await subResp.text();
  let proxies = parseSubToProxies(rawSubData);

  // 节点关键词过滤
  const filterRegex = /(群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author)/i;
  
  return proxies.filter(p => p && !filterRegex.test(p));
}

// ==================== 辅助功能：订阅解析器 ====================
function parseSubToProxies(data) {
  data = data.trim();

  if (!data.includes('proxies:') && !data.includes('port:')) {
    try {
      const decoded = atob(data.replace(/\s/g, ''));
      if (decoded.includes('proxies:')) {
        data = decoded;
      }
    } catch (e) {}
  }

  if (data.includes('proxies:')) {
    const match = data.match(/proxies:\s*\n([\s\S]*?)(?=\n[a-zA-Z0-9_-]+:|$)/);
    if (match && match[1]) {
      return parseYamlProxiesBlock(match[1]);
    }
  }

  return [];
}

function parseYamlProxiesBlock(proxiesBlock) {
  const lines = proxiesBlock.split('\n');
  const proxies = [];
  let currentProxyStr = '';

  for (const line of lines) {
    if (line.trim().startsWith('- name:') || line.trim().startsWith('- { name:')) {
      if (currentProxyStr) {
        proxies.push(currentProxyStr);
      }
      currentProxyStr = line + '\n';
    } else if (currentProxyStr) {
      currentProxyStr += line + '\n';
    }
  }
  if (currentProxyStr) proxies.push(currentProxyStr);

  return proxies;
}

// ==================== 辅助功能：生成完整 YAML ====================
function buildFinalYaml(version, proxies) {
  const proxiesYamlStr = proxies.join('');

  return `
mode: rule
mixed-port: 7893
allow-lan: false
log-level: info
unified-delay: true
tcp-concurrent: true
find-process-mode: always

dns:
  enable: true
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29

proxies:
${proxiesYamlStr}

x-url-test: &url-test
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  interval: 300
  tolerance: 50
  include-all: true
  hidden: true

x-fallback: &fallback
  type: fallback
  url: http://cp.cloudflare.com/generate_204
  interval: 300
  include-all: true

x-filter-hk: &filter-hk "(?i)(香港|港深|深港|沪港|广港|陆港|hk|hkg|hongkong|hong.?kong|🇭🇰)"
x-filter-tw: &filter-tw "(?i)(台湾|台北|台中|台南|台东|湾湾|tw|tpe|taiwan|taipei|🇹🇼)"
x-filter-jp: &filter-jp "(?i)(日本|东京|大阪|京都|jp|nrt|hnd|kix|japan|tokyo|🇯🇵)"
x-filter-sg: &filter-sg "(?i)(新加坡|坡县|坡|狮城|sg|sin|singapore|🇸🇬)"
x-filter-kr: &filter-kr "(?i)(韩国|韓國|首尔|首爾|kr|icn|korea|seoul|🇰🇷)"
x-filter-us: &filter-us "(?i)(美国|美东|美西|美中|us|usa|america|united.?states|🇺🇸)"

x-oversea: &oversea [故障转移, 全球手动, 香港策略, 台湾策略, 日本策略, 狮城策略, 韩国策略, 美国策略, DIRECT]
x-direct: &direct [DIRECT, 故障转移, 全球手动, 香港策略, 台湾策略, 日本策略, 狮城策略, 韩国策略, 美国策略]
x-us-first: &us-first [美国策略, 故障转移, 全球手动, 香港策略, 台湾策略, 日本策略, 狮城策略, 韩国策略, DIRECT]
x-sg-first: &sg-first [狮城策略, 故障转移, 全球手动, 香港策略, 台湾策略, 日本策略, 韩国策略, 美国策略, DIRECT]

proxy-groups:
  - name: 即时通讯
    type: select
    proxies: *sg-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Telegram_X.png
  - name: 社交平台
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Twitter.png
  - name: 人工智能
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/AI.png
  - name: 开发服务
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/GitHub.png
  - name: 国际媒体
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Streaming.png
  - name: 谷歌服务
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Google_Search.png
  - name: 苹果服务
    type: select
    proxies: *direct
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Apple_1.png
  - name: 国外流量
    type: select
    proxies: *oversea
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Global.png
  - name: 国内流量
    type: select
    proxies: *direct
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/China.png
  - name: 漏网之鱼
    type: select
    proxies: *oversea
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png
  - name: 故障转移
    <<: *fallback
    proxies: [美国策略, 日本策略, 狮城策略, 韩国策略, 香港策略, 台湾策略]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/ULB.png
  - name: 全球手动
    type: select
    include-all: true
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Clubhouse.png
  - name: 香港策略
    <<: *url-test
    filter: *filter-hk
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Hong_Kong.png
  - name: 台湾策略
    <<: *url-test
    filter: *filter-tw
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Taiwan.png
  - name: 日本策略
    <<: *url-test
    filter: *filter-jp
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Japan.png
  - name: 狮城策略
    <<: *url-test
    filter: *filter-sg
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Singapore.png
  - name: 韩国策略
    <<: *url-test
    filter: *filter-kr
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Korea.png
  - name: 美国策略
    <<: *url-test
    filter: *filter-us
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/United_States.png

rules:
  - RULE-SET,Private,DIRECT
  - RULE-SET,PrivateIP,DIRECT,no-resolve
  # 优先匹配 Telegram 域名与 IP（去掉 no-resolve 以防漏抓直连流量）
  - RULE-SET,Telegram,即时通讯
  - RULE-SET,TelegramIP,即时通讯
  - RULE-SET,TM,即时通讯
  - RULE-SET,SocialMedia,社交平台
  - RULE-SET,SocialMediaIP,社交平台,no-resolve
  - RULE-SET,AI,人工智能
  - RULE-SET,AIIP,人工智能,no-resolve
  - RULE-SET,Dev,开发服务
  - RULE-SET,Streaming,国际媒体
  - RULE-SET,StreamingIP,国际媒体,no-resolve
  - RULE-SET,Google,谷歌服务
  - RULE-SET,GoogleIP,谷歌服务,no-resolve
  - RULE-SET,Apple,苹果服务
  - RULE-SET,Proxy,国外流量
  - RULE-SET,ProxyIP,国外流量,no-resolve
  - RULE-SET,China,国内流量
  - RULE-SET,ChinaIP,国内流量,no-resolve
  - MATCH,漏网之鱼

rule-providers:
  Private: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Private.mrs}
  TM: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/TM.mrs}
  Telegram: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Telegram.mrs}
  SocialMedia: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/SocialMedia.mrs}
  AI: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/AI.mrs}
  Dev: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Dev.mrs}
  Streaming: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Streaming.mrs}
  Google: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Google.mrs}
  Apple: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Apple.mrs}
  Proxy: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Proxy.mrs}
  China: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/China.mrs}
  PrivateIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Private.mrs}
  TelegramIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Telegram.mrs}
  SocialMediaIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/SocialMedia.mrs}
  AIIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/AI.mrs}
  StreamingIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Streaming.mrs}
  GoogleIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Google.mrs}
  ProxyIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Proxy.mrs}
  ChinaIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/China.mrs}
`;
}

// ==================== 前端 HTML 视图页面 ====================
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>666OS 订阅转换服务</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 {
      text-align: center;
      font-size: 26px;
      margin-bottom: 8px;
      background: linear-gradient(90deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { text-align: center; color: #94a3b8; margin-bottom: 28px; font-size: 14px; }
    .card {
      background: #1e293b;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #334155;
    }
    label { display: block; margin-bottom: 8px; font-size: 14px; color: #94a3b8; }
    input, select {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #475569;
      background: #0f172a;
      color: #e2e8f0;
      margin-bottom: 16px;
      outline: none;
    }
    .btn-group { display: flex; gap: 10px; margin-bottom: 16px; }
    button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #334155; color: #e2e8f0; }
    #result { display: none; margin-top: 20px; }
    textarea {
      width: 100%;
      height: 120px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #475569;
      background: #0f172a;
      color: #60a5fa;
      font-family: monospace;
      font-size: 13px;
      resize: none;
    }
    .action-btns { display: flex; gap: 10px; margin-top: 10px; }
    .copy-btn { background: #10b981; color: white; }
    .status { text-align: center; margin: 12px 0; font-size: 14px; }
    .link-box {
      background: #0f172a;
      border: 1px dashed #60a5fa;
      padding: 12px;
      border-radius: 8px;
      word-break: break-all;
      margin-bottom: 12px;
      font-family: monospace;
      font-size: 13px;
      color: #93c5fd;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>666OS 订阅转换服务</h1>
    <p class="subtitle">支持生成客户端专属订阅链接，填入 App 自动更新节点</p>

    <div class="card">
      <label>机场订阅链接</label>
      <input type="text" id="subUrl" placeholder="粘贴你的机场通用 / Clash 订阅链接" />

      <label>配置版本</label>
      <select id="version">
        <option value="lite">Lite 版</option>
        <option value="pro">Pro 版</option>
      </select>

      <label>自定义访问 Key / 密码 (可选，增强隐蔽性)</label>
      <input type="text" id="secretKey" placeholder="例如：mysecret123 (可不填)" />

      <div class="btn-group">
        <button class="btn-primary" onclick="generateLink()">生成通用订阅链接</button>
        <button class="btn-secondary" onclick="clearAll()">清空</button>
      </div>

      <div class="status" id="status"></div>

      <div id="result">
        <label>你的专属订阅链接 (直接复制粘贴到 Clash / App 中)：</label>
        <div class="link-box" id="subLinkText"></div>
        <div class="action-btns">
          <button class="copy-btn" onclick="copyLink()">一键复制订阅链接</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    function generateLink() {
      const subUrl = document.getElementById('subUrl').value.trim();
      const version = document.getElementById('version').value;
      const secretKey = document.getElementById('secretKey').value.trim();
      const status = document.getElementById('status');
      const result = document.getElementById('result');
      const subLinkText = document.getElementById('subLinkText');

      if (!subUrl) {
        status.textContent = '请输入机场订阅链接';
        status.style.color = '#f87171';
        return;
      }

      // 链接安全转码
      const encodedSub = encodeURIComponent(btoa(subUrl));
      const origin = window.location.origin;

      let finalSubUrl = \`\${origin}/sub?url=\${encodedSub}&version=\${version}\`;
      if (secretKey) {
        finalSubUrl += \`&key=\${encodeURIComponent(secretKey)}\`;
      }

      subLinkText.textContent = finalSubUrl;
      result.style.display = 'block';
      status.textContent = '生成成功！请复制下方订阅链接：';
      status.style.color = '#34d399';
    }

    function copyLink() {
      const text = document.getElementById('subLinkText').textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('订阅链接已复制到剪贴板！可以直接填入 Clash / Mihomo 中');
      });
    }

    function clearAll() {
      document.getElementById('subUrl').value = '';
      document.getElementById('secretKey').value = '';
      document.getElementById('result').style.display = 'none';
      document.getElementById('status').textContent = '';
    }
  </script>
</body>
</html>`;
