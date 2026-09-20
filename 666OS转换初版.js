export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const subUrl = formData.get('subUrl')?.trim();
        const version = formData.get('version') || 'lite';

        if (!subUrl) {
          return new Response(JSON.stringify({ error: '请输入订阅链接' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 使用已验证可加载节点的模板
        let yaml = version === 'pro' ? PRO_TEMPLATE : LITE_TEMPLATE;

        // 只替换订阅链接
        yaml = yaml.replace(
          /url: "https:\/\/yfjc\.xyz\/api\/v1\/client\/subscribe\?token=[^"]+"/,
          `url: "${subUrl}"`
        );

        // 如果用户输入的链接里没有 flag=meta，自动补上（很多机场需要）
        if (!subUrl.includes('flag=')) {
          yaml = yaml.replace(
            `url: "${subUrl}"`,
            `url: "${subUrl}${subUrl.includes('?') ? '&' : '?'}flag=meta"`
          );
        }

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

// ==================== 已验证可用的 Lite 模板 ====================
const LITE_TEMPLATE = `# Lite 修复版 + 恢复图标

x-base-provider: &base-provider
  type: http
  interval: 3600
  health-check:
    enable: true
    url: http://cp.cloudflare.com/generate_204
    interval: 300
    timeout: 5000
  filter: '^(?!.*(群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author))'

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
    url: "https://yfjc.xyz/api/v1/client/subscribe?token=5b311b129d4cc5cce855db4be3c7b1d0&flag=meta"
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

// ==================== 已验证可用的 Pro 模板 ====================
const PRO_TEMPLATE = `# Pro 中文版 修复版（适配 Clash Party）

x-base-provider: &base-provider
  type: http
  interval: 3600
  health-check:
    enable: true
    url: http://cp.cloudflare.com/generate_204
    interval: 300
    timeout: 5000
  filter: '^(?!.*(群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author))'

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
    url: "https://yfjc.xyz/api/v1/client/subscribe?token=5b311b129d4cc5cce855db4be3c7b1d0&flag=meta"
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

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>666OS YAML 生成器</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 920px; margin: 0 auto; }
    h1 {
      text-align: center;
      font-size: 28px;
      margin-bottom: 8px;
      background: linear-gradient(90deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      text-align: center;
      color: #94a3b8;
      margin-bottom: 36px;
      font-size: 14px;
    }
    .card {
      background: #1e293b;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      border: 1px solid #334155;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #94a3b8;
    }
    input, select {
      width: 100%;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1px solid #475569;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 15px;
      margin-bottom: 20px;
      outline: none;
    }
    input:focus, select:focus { border-color: #60a5fa; }
    .btn-group { display: flex; gap: 12px; margin-bottom: 20px; }
    button {
      flex: 1;
      padding: 14px;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      color: white;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary { background: #334155; color: #e2e8f0; }
    .btn-secondary:hover { background: #475569; }
    #result { display: none; margin-top: 24px; }
    textarea {
      width: 100%;
      height: 420px;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #475569;
      background: #0f172a;
      color: #e2e8f0;
      font-family: "SF Mono", Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: vertical;
    }
    .action-btns { display: flex; gap: 12px; margin-top: 14px; }
    .copy-btn { background: #10b981; color: white; }
    .copy-btn:hover { background: #059669; }
    .download-btn { background: #3b82f6; color: white; }
    .download-btn:hover { background: #2563eb; }
    .status {
      text-align: center;
      margin: 16px 0;
      font-size: 14px;
      color: #94a3b8;
      min-height: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #64748b;
      font-size: 13px;
    }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>666OS YAML 生成器</h1>
    <p class="subtitle">基于已验证可加载节点的模板 · 一键替换订阅</p>

    <div class="card">
      <label>机场 / 节点订阅链接</label>
      <input type="text" id="subUrl" placeholder="粘贴你的订阅链接" />

      <label>选择版本</label>
      <select id="version">
        <option value="lite">Lite（轻量推荐）</option>
        <option value="pro">Pro（完整功能，含广告拦截）</option>
      </select>

      <div class="btn-group">
        <button class="btn-primary" onclick="generate()">生成 YAML</button>
        <button class="btn-secondary" onclick="clearAll()">清空</button>
      </div>

      <div class="status" id="status"></div>

      <div id="result">
        <label>生成的 YAML</label>
        <textarea id="yamlOutput" readonly></textarea>
        <div class="action-btns">
          <button class="copy-btn" onclick="copyYaml()">一键复制 YAML</button>
          <button class="download-btn" onclick="downloadYaml()">下载 YAML 文件</button>
        </div>
      </div>
    </div>

    <div class="footer">
      模板来源：已验证可加载节点的版本
    </div>
  </div>

  <script>
    let currentVersion = 'lite';

    async function generate() {
      const subUrl = document.getElementById('subUrl').value.trim();
      const version = document.getElementById('version').value;
      currentVersion = version;
      const status = document.getElementById('status');
      const result = document.getElementById('result');
      const output = document.getElementById('yamlOutput');

      if (!subUrl) {
        status.textContent = '请先输入订阅链接';
        status.style.color = '#f87171';
        return;
      }

      status.textContent = '正在生成，请稍候...';
      status.style.color = '#94a3b8';
      result.style.display = 'none';

      try {
        const formData = new FormData();
        formData.append('subUrl', subUrl);
        formData.append('version', version);

        const res = await fetch('/generate', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.error) {
          status.textContent = '错误：' + data.error;
          status.style.color = '#f87171';
          return;
        }

        output.value = data.yaml;
        result.style.display = 'block';
        status.textContent = '生成成功！可复制或下载使用';
        status.style.color = '#34d399';
      } catch (err) {
        status.textContent = '请求失败：' + err.message;
        status.style.color = '#f87171';
      }
    }

    function copyYaml() {
      const output = document.getElementById('yamlOutput');
      output.select();
      document.execCommand('copy');
      document.getElementById('status').textContent = '已复制到剪贴板！';
      document.getElementById('status').style.color = '#34d399';
    }

    function downloadYaml() {
      const content = document.getElementById('yamlOutput').value;
      if (!content) return;

      const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentVersion === 'pro' ? '666OS-Pro.yaml' : '666OS-Lite.yaml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      document.getElementById('status').textContent = 'YAML 文件已开始下载';
      document.getElementById('status').style.color = '#34d399';
    }

    function clearAll() {
      document.getElementById('subUrl').value = '';
      document.getElementById('yamlOutput').value = '';
      document.getElementById('result').style.display = 'none';
      document.getElementById('status').textContent = '';
    }
  </script>
</body>
</html>`;