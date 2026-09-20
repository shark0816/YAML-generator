export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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

        // 自动补全 flag=meta（部分机场订阅必需）
        if (!subUrl.includes('flag=')) {
          subUrl += (subUrl.includes('?') ? '&' : '?') + 'flag=meta';
        }

        // ========== 优先使用内置经过验证的稳定模板 ==========
        // 说明：不再盲目依赖 raw.githubusercontent.com，避免格式错乱或被阻断导致的匹配失败
        let yaml = version === 'pro' ? PRO_TEMPLATE : LITE_TEMPLATE;

        // 尝试拉取上游最新版，如果格式完整则使用
        const upstreamUrl = version === 'pro'
          ? 'https://raw.githubusercontent.com/666OS/YYDS/main/mihomo/config/cn/Pro_cn.yaml'
          : 'https://raw.githubusercontent.com/666OS/YYDS/main/mihomo/config/cn/Lite_cn.yaml';

        try {
          const resp = await fetch(upstreamUrl, {
            cf: { cacheTtl: 3600 },
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });

          if (resp.ok) {
            const fetchedText = await resp.text();
            if (fetchedText.includes('proxy-providers:') && fetchedText.includes('x-base-provider:')) {
              yaml = fetchedText;
            }
          }
        } catch (fetchErr) {
          console.log('拉取上游失败，降级使用内置稳定模板');
        }

        // ========== 关键修复逻辑 ==========

        // 1. 修复 x-base-provider（适当放宽 filter，防止误杀有效节点）
        const fixedBaseProvider = `x-base-provider: &base-provider
  type: http
  interval: 3600
  health-check:
    enable: true
    url: http://cp.cloudflare.com/generate_204
    interval: 300
    timeout: 5000
  filter: '^(?!.*(群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author))'`;

        // 使用更具通用性的正则表达式替换 x-base-provider 块
        yaml = yaml.replace(/x-base-provider:\s*&base-provider[\s\S]*?(?=\nx-[a-z-]+:|\nproxies:|\nproxy-providers:)/i, fixedBaseProvider + '\n\n');

        // 2. 强力替换/注入 proxy-providers
        const providerBlock = `proxy-providers:
  Primary:
    <<: *base-provider
    url: "${subUrl}"
    override:
      additional-prefix: "[P] "`;

        if (yaml.includes('proxy-providers:')) {
          yaml = yaml.replace(/proxy-providers:[\s\S]*?(?=\nproxies:|\n# 自定义代理节点|\n# 基础设置|\nmode:)/i, providerBlock + '\n\n');
        } else {
          // 若不存在，直接注入在 proxies: 前面
          yaml = yaml.replace(/proxies:/i, providerBlock + '\n\nproxies:');
        }

        // 3. 替换掉 PLACEHOLDER 占位符（防止某些内置模板没有被替换到）
        yaml = yaml.replace(/url:\s*["']PLACEHOLDER["']/g, `url: "${subUrl}"`);

        // 4. 强制替换测速链接为 Cloudflare 生成页，解决谷歌 204 超时造成的节点不显示问题
        yaml = yaml.replace(/https?:\/\/www\.(google|gstatic)\.com\/generate_204/g, 'http://cp.cloudflare.com/generate_204');

        // 5. 格式清理
        yaml = yaml.replace(/\n{3,}/g, '\n\n');

        return new Response(JSON.stringify({ yaml }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || '生成失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

// ==================== 兜底模板（默认已修正了 filter 正则和占位符） ====================
const LITE_TEMPLATE = `# Lite 修复版（兜底）

x-base-provider: &base-provider
  type: http
  interval: 3600
  health-check:
    enable: true
    url: http://cp.cloudflare.com/generate_204
    interval: 300
    timeout: 5000
  filter: '^(?!.*(群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author))'

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

proxy-providers:
  Primary:
    <<: *base-provider
    url: "PLACEHOLDER"
    override:
      additional-prefix: "[P] "

proxies: []

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
  - RULE-SET,TM,即时通讯
  - RULE-SET,Telegram,即时通讯
  - RULE-SET,TelegramIP,即时通讯,no-resolve
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

const PRO_TEMPLATE = `# Pro 修复版（兜底）

x-base-provider: &base-provider
  type: http
  interval: 3600
  health-check:
    enable: true
    url: http://cp.cloudflare.com/generate_204
    interval: 300
    timeout: 5000
  filter: '^(?!.*(群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author))'

x-url-test: &url-test
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  interval: 300
  tolerance: 50
  include-all: true
  hidden: true

x-load-balance: &load-balance
  type: load-balance
  url: http://cp.cloudflare.com/generate_204
  interval: 300
  include-all: true
  hidden: true
  strategy: consistent-hashing

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
x-jp-first: &jp-first [日本策略, 故障转移, 全球手动, 香港策略, 台湾策略, 狮城策略, 韩国策略, 美国策略, DIRECT]
x-sg-first: &sg-first [狮城策略, 故障转移, 全球手动, 香港策略, 台湾策略, 日本策略, 韩国策略, 美国策略, DIRECT]

proxy-providers:
  Primary:
    <<: *base-provider
    url: "PLACEHOLDER"
    override:
      additional-prefix: "[P] "

proxies: []

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

proxy-groups:
  - name: 广告拦截
    type: select
    proxies: [REJECT-DROP, REJECT, DIRECT]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Reject.png
  - name: 网络测试
    type: select
    proxies: *oversea
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Speedtest.png
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
  - name: EMBY
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Emby.png
  - name: 国际媒体
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Streaming.png
  - name: 游戏平台
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Game.png
  - name: 货币平台
    type: select
    proxies: *jp-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Cryptocurrency_3.png
  - name: 谷歌服务
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Google_Search.png
  - name: 脸书服务
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Facebook.png
  - name: 微软服务
    type: select
    proxies: *us-first
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Microsoft.png
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
    type: select
    include-all: true
    filter: *filter-hk
    proxies: [香港自动, 香港均衡]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Hong_Kong.png
  - name: 台湾策略
    type: select
    include-all: true
    filter: *filter-tw
    proxies: [台湾自动, 台湾均衡]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Taiwan.png
  - name: 日本策略
    type: select
    include-all: true
    filter: *filter-jp
    proxies: [日本自动, 日本均衡]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Japan.png
  - name: 狮城策略
    type: select
    include-all: true
    filter: *filter-sg
    proxies: [狮城自动, 狮城均衡]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Singapore.png
  - name: 韩国策略
    type: select
    include-all: true
    filter: *filter-kr
    proxies: [韩国自动, 韩国均衡]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Korea.png
  - name: 美国策略
    type: select
    include-all: true
    filter: *filter-us
    proxies: [美国自动, 美国均衡]
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/United_States.png
  - name: 香港自动
    <<: *url-test
    filter: *filter-hk
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Auto.png
  - name: 台湾自动
    <<: *url-test
    filter: *filter-tw
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Auto.png
  - name: 日本自动
    <<: *url-test
    filter: *filter-jp
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Auto.png
  - name: 狮城自动
    <<: *url-test
    filter: *filter-sg
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Auto.png
  - name: 韩国自动
    <<: *url-test
    filter: *filter-kr
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Auto.png
  - name: 美国自动
    <<: *url-test
    filter: *filter-us
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Auto.png
  - name: 香港均衡
    <<: *load-balance
    filter: *filter-hk
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Round_Robin_1.png
  - name: 台湾均衡
    <<: *load-balance
    filter: *filter-tw
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Round_Robin_1.png
  - name: 日本均衡
    <<: *load-balance
    filter: *filter-jp
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Round_Robin_1.png
  - name: 狮城均衡
    <<: *load-balance
    filter: *filter-sg
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Round_Robin_1.png
  - name: 韩国均衡
    <<: *load-balance
    filter: *filter-kr
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Round_Robin_1.png
  - name: 美国均衡
    <<: *load-balance
    filter: *filter-us
    icon: https://github.com/Koolson/Qure/raw/master/IconSet/Color/Round_Robin_1.png

rules:
  - RULE-SET,Tracking,广告拦截
  - RULE-SET,Advertising,广告拦截
  - RULE-SET,Private,DIRECT
  - RULE-SET,PrivateIP,DIRECT,no-resolve
  - RULE-SET,Speedtest,网络测试
  - RULE-SET,TM,即时通讯
  - RULE-SET,Telegram,即时通讯
  - RULE-SET,TelegramIP,即时通讯,no-resolve
  - RULE-SET,SocialMedia,社交平台
  - RULE-SET,SocialMediaIP,社交平台,no-resolve
  - RULE-SET,AI,人工智能
  - RULE-SET,AIIP,人工智能,no-resolve
  - RULE-SET,Dev,开发服务
  - RULE-SET,Emby,EMBY
  - RULE-SET,EmbyIP,EMBY,no-resolve
  - RULE-SET,Streaming,国际媒体
  - RULE-SET,StreamingIP,国际媒体,no-resolve
  - RULE-SET,Games,游戏平台
  - RULE-SET,Crypto,货币平台
  - RULE-SET,Google,谷歌服务
  - RULE-SET,GoogleIP,谷歌服务,no-resolve
  - RULE-SET,Microsoft,微软服务
  - RULE-SET,Facebook,脸书服务
  - RULE-SET,Apple,苹果服务
  - RULE-SET,Proxy,国外流量
  - RULE-SET,ProxyIP,国外流量,no-resolve
  - RULE-SET,China,国内流量
  - RULE-SET,ChinaIP,国内流量,no-resolve
  - MATCH,漏网之鱼

rule-providers:
  Tracking: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Tracking.mrs}
  Advertising: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Advertising.mrs}
  Private: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Private.mrs}
  Apple: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Apple.mrs}
  Telegram: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Telegram.mrs}
  TM: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/TM.mrs}
  SocialMedia: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/SocialMedia.mrs}
  AI: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/AI.mrs}
  Dev: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Dev.mrs}
  Emby: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Emby.mrs}
  Streaming: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Streaming.mrs}
  Games: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Games.mrs}
  Crypto: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Crypto.mrs}
  Google: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Google.mrs}
  Microsoft: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Microsoft.mrs}
  Facebook: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Facebook.mrs}
  Proxy: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Proxy.mrs}
  China: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/China.mrs}
  Speedtest: {type: http, behavior: domain, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/domain/Speedtest.mrs}
  PrivateIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Private.mrs}
  TelegramIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Telegram.mrs}
  SocialMediaIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/SocialMedia.mrs}
  AIIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/AI.mrs}
  EmbyIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Emby.mrs}
  StreamingIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Streaming.mrs}
  GoogleIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Google.mrs}
  ProxyIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/Proxy.mrs}
  ChinaIP: {type: http, behavior: ipcidr, format: mrs, interval: 86400, url: https://github.com/666OS/rules/raw/release/mihomo/ip/China.mrs}
`;

// 前端页面逻辑保持原样
const html = `...`; // 页面代码不需要变动
