
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
    - { name: 🇺🇸美国专线01, server: 132.145.137.155, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: 13a95d801c2b834991f49ce6c6fe754809f8ca2dbf52a4dbc1aeb6885b46cb27 }
    - { name: 🇺🇸美国专线02, server: 129.146.124.201, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: d97a9e258f15741cbdbee2ccb4580b20abec969ca70f272f4c1970dfce944ff1 }
    - { name: 🇦🇺澳大利亚专线01, server: 159.13.40.81, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: 9b92e6da557f1d4cc0c698d135154f07b8ab39f67d5714ce841b21a324a03b33 }
    - { name: 🇦🇺澳大利亚专线02, server: 192.9.179.140, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: 8d120b1449b52fe48e98e41c7ee5c0c471574179d5b2e968ba3db5f7575a63a4 }
    - { name: 🇮🇳印度专线01, server: 144.24.109.215, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: 236656426d6094bd5dac2054533d713854d14ce89a41ca0da7e9a6a14d2a7edf }
    - { name: 🇮🇳印度专线02, server: 141.148.222.181, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: 3657f3d6126f53ae984af56c82b7744ca55f31f49dea560996112af192ed1177 }
    - { name: 🇧🇷巴西专线01, server: 168.75.68.172, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: 615b8e1622a98c5f1da3c923bb64b07bd04749146b33a134125dc1a6920ba04c }
    - { name: 🇧🇷巴西专线02, server: 144.22.197.28, port: 51000, ports: 51000-53000, mport: 51000-53000, udp: true, skip-cert-verify: true, sni: cn.cremedelamer.com, type: hysteria2, password: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, fingerprint: 395981c03224ffc29cdda4e168cada627e08bba5af89cc711e6c136580445bf4 }
    - { name: 🇺🇸美国高速01, type: vless, server: 63.141.128.158, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: '', client-fingerprint: chrome, network: ws, ws-opts: { path: /ym/us1, headers: { Host: us1s.xn--mirrors-oj8km52txc7d.com } } }
    - { name: 🇺🇸美国高速02, type: vless, server: 63.141.128.158, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: '', client-fingerprint: chrome, network: ws, ws-opts: { path: /ym/us2, headers: { Host: us2s.xn--mirrors-oj8km52txc7d.com } } }
    - { name: 🇮🇳印度高速01, type: vless, server: 63.141.128.158, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: '', client-fingerprint: chrome, network: ws, ws-opts: { path: /ym/in1, headers: { Host: in1s.xn--mirrors-oj8km52txc7d.com } } }
    - { name: 🇦🇺澳大利亚高速01, type: vless, server: 63.141.128.158, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: '', client-fingerprint: chrome, network: ws, ws-opts: { path: /ym/au1, headers: { Host: au1s.xn--mirrors-oj8km52txc7d.com } } }
    - { name: 🇦🇺澳大利亚高速02, type: vless, server: 63.141.128.158, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: '', client-fingerprint: chrome, network: ws, ws-opts: { path: /ym/au2, headers: { Host: au2s.xn--mirrors-oj8km52txc7d.com } } }
    - { name: 🇫🇷法国高速01, type: vless, server: 63.141.128.158, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: '', client-fingerprint: chrome, network: ws, ws-opts: { path: /ym/fr1, headers: { Host: fr1s.xn--mirrors-oj8km52txc7d.com } } }
    - { name: 🇫🇷法国马赛, type: vless, server: 144.24.206.147, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: xtls-rprx-vision, client-fingerprint: chrome, servername: updates.cdn-apple.com, reality-opts: { public-key: PbE_bZXVNqPOIdkffGIuwgJRlRrW2FLinx3bZ9jgdkk, short-id: 558ae2c2 } }
    - { name: 🇺🇸美国圣何塞01, type: vless, server: 192.9.142.185, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: xtls-rprx-vision, client-fingerprint: chrome, servername: updates.cdn-apple.com, reality-opts: { public-key: VfpWBFurCnD5vlLddUI0L7SZmtUMewB_eDe8J4ylo34, short-id: ec33edce } }
    - { name: 🇺🇸美国圣何塞02, type: vless, server: 165.1.68.155, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: xtls-rprx-vision, client-fingerprint: chrome, servername: updates.cdn-apple.com, reality-opts: { public-key: Ab-BOqKWcxRp1eyCRKgXLm6TKNIutbrWd_mZPf4VlAc, short-id: 042a1f2c } }
    - { name: 🇳🇱荷兰阿姆斯特丹, type: vless, server: 158.101.195.118, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: xtls-rprx-vision, client-fingerprint: chrome, servername: updates.cdn-apple.com, reality-opts: { public-key: zqxFCQCJpH6bAW8Rx3mlL_Cl9AQthiEWFOd6iFyMwAI, short-id: 38d05146 } }
    - { name: 🇬🇧英国伦敦, type: vless, server: 141.147.102.96, port: 443, uuid: d8442c3c-5b28-4b2d-a8a9-ff8444fa6083, udp: true, tls: true, skip-cert-verify: false, flow: xtls-rprx-vision, client-fingerprint: chrome, servername: updates.cdn-apple.com, reality-opts: { public-key: hWMyxt6Zp2m_sDV_RRykpYJ3Ds88O6wnuE6xQjcPnXQ, short-id: db9b6326 } }


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
