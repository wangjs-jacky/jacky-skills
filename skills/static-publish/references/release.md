# Cloudflare 页面发布、验收与回退

资源准备完成后读取。首版用官方 Wrangler 执行云端操作，工具冻结显式公开文件和核验。Wrangler 需项目锁定或已有可用入口；以下 `wrangler` 代表该真实官方入口（如项目 `node_modules/.bin/wrangler`），不是要求全局安装。先用其 `--help` 核对当前版本；不使用会临时下载未知版本的裸 npx。

## 先辨认目标

只处理纯静态 Workers Static Assets。没有账号先引导官方登录；已登录用一次 whoami 确认账号。已有目标需读取当前配置、活动版本、域映射及其他发布者的变化：保留现有 main/bindings/vars/routes/headers 等工程职责。下面生成器适合独立 assets-only 目标，不可用它覆盖有业务 Worker、Access、路由、重定向或自定义安全头的生产配置。此类项目复用原配置/构建入口，将文件清单/核验接入原链路；先审阅真实上传集合。新目标需确认不存在，避免同名覆盖。

云控制命令只在本轮公开发布及精确目标授权内执行。已授权步骤连续完成，不因每个命令再索要确认。不能由 --apply、本文命令或 Skill 安装推导新增域名、付费、删桶或发布其他项目的授权。

## 资源先就绪

资源工具只列本次公开的图片/字体/媒体/下载文件。prepare 写出内容地址及唯一清单 source→publicURL，页面构建消费这份清单；业务目录保持原 ID、来源和许可信息。OSS 模式先 publish --apply，再 verify 全部条目；任一失败不激活新页面。已知桶不需要 ListBuckets，权限/地域错误不能当作 NoSuchKey。

同站模式把 prepare 输出复制/生成到页面 dist 对应资源根，并将每个必需文件显式列入 site.json。不要把云配置、私有派生记录或源码纳入 dist。需要 iframe DOM 的 HTML 保持同源；OSS 图片成功不证明 fetch/canvas CORS。

## 冻结页面快照

页面配置与资源配置分开。以下摘要文件名仅示意，实际必须来自构建或资源计划：

```json
{
  "version": 1,
  "publicDir": "./dist",
  "files": ["index.html", "assets/0123456789abcdef.webp"],
  "immutable": ["assets/0123456789abcdef.webp"],
  "worker": {
    "name": "example-static-project",
    "compatibilityDate": "2026-11-04"
  }
}
```

日期使用项目实际兼容日期；可选 accountId 指定用户自己账号，不是密钥。files 必须包含全部页面和依赖（包括深层派生图），不是 glob；immutable 必须在 files 内，文件名中至少12位摘要与完整文件 SHA 前缀匹配。没有内容地址时删除 immutable 项，不给固定入口设置长期缓存。

```bash
node "$SKILL_DIR/scripts/doctor.mjs" site.json --auth --wrangler ./node_modules/.bin/wrangler
node "$SKILL_DIR/scripts/site.mjs" plan site.json
node "$SKILL_DIR/scripts/site.mjs" prepare site.json release-001
node "$SKILL_DIR/scripts/site.mjs" check release-001
```

新 release 目录不能已存在；保留旧快照。只将 release/public 上传；wrangler.json 和 release-manifest.json 留在外面。check 拒绝快照新增/缺失/变化文件、符号链接及配置变化。生成器不继承 .assetsignore，因此不受旧通配符漏深层图片影响；也不分析 HTML/CSS/JS 中全部运行时依赖，显式列表仍须由构建清单和浏览器实际请求核对。

生成的 _headers 为入口及未版本化资源再验证，只给内容地址长期 immutable；HTML 的规范路径和带扩展名路径保留 no-transform。重叠规则先 `! Cache-Control` 再设置，避免同名头拼接。不要全局移除 no-transform：平台自动插入脚本可能影响 iframe load；数据/脚本等可压缩，实际响应另验。默认超过100条规则停止生成，大站需在工程内设计受限目录规则并保留原安全头。

## 候选、激活和读回

先分流首次发布和已有目标，**不要对已确认不存在的新目标继续执行下面的已有目标序列**。目标不存在的特定结果仅用于初始化判断；认证、权限、地域或网络失败不是可忽略的“不存在”。

- 新目标：在归属/名称/公开文件已确认后运行 `wrangler deploy --config RELEASE/wrangler.json` 首次创建并直接上线；保存实际 URL/首版 UUID，然后单次读回部署、运行 verify 和浏览器验收。此时没有旧版本可回退。当前 Wrangler 对不存在目标的 versions upload 会明确拒绝，不能把该命令当作首次创建器。
- 已有纯静态目标：使用下面的候选流程；每个命令独立执行并检查返回，非预期失败即停，不用整段 Shell 无条件串行，也不轮询。RELEASE、CANDIDATE、OLD_VERSION、ORIGIN 均是本轮真实记录，不要原样执行占位值。

```bash
wrangler whoami
wrangler deployments status --config RELEASE/wrangler.json --json
wrangler versions upload --config RELEASE/wrangler.json --dry-run
wrangler versions upload --config RELEASE/wrangler.json --message "public static release"
```

已有目标先保存实际活动版本及比例。读取上传日志与实际文件集合，保存候选 UUID。**上传版本不等于上线**；候选未激活时做一次 deployments status，确认旧活动版本仍是基线。前提改变时停止激活，合入新基线后重建，不覆盖其他人的更新。

```bash
node "$SKILL_DIR/scripts/site.mjs" check RELEASE
wrangler deployments status --config RELEASE/wrangler.json --json
wrangler versions deploy CANDIDATE@100 --config RELEASE/wrangler.json --yes
wrangler deployments status --config RELEASE/wrangler.json --json
node "$SKILL_DIR/scripts/site.mjs" verify RELEASE https://site.example.org
```

保留实际部署入口，不自动绑定/改 DNS 或其他域名。

激活后只读一次实际部署，核对预期 UUID 和100%；verify 对所有选定公开载荷一次完整 GET，跟随静态 HTML 规范跳转，检查 MIME（JS接受两种标准类型）、长度、完整 SHA 和 immutable 适用范围。_headers 是平台控制文件，检查其本地摘要，不臆称其公网一定404；Wrangler配置/清单本来就在公开根外，隔离另用真实私有原件对应 URL 验证。

核验中途失败时 stdout 的 JSON 保留 verified、failed（精确 key 与错误）及 notAttempted，exit1；尚未尝试的文件不算通过。网络失败保留原失败记录；不要因响应不完整就重新发布。资源补验可复制原非敏感配置、仅保留失败/未试 source；页面补验按 release-manifest 精确 URL/摘要作单次 GET，原快照不修改。全部缺口补齐后才更新整批验收结论。

当前 Node 的默认 fetch 网络路径可能与官方 CLI 不同。若本机本就使用代理，按 Node 版本启用其受支持的环境代理方式（Node24可单次设置 NODE_USE_ENV_PROXY=1）；不改全局网络，不把传输失败解释为云发布失败。HTTP byte verification 输出明确 browserVerified=false、activeVersionVerified=false，它不替代上面的版本读回或下面的浏览器验收。

## 浏览器、性能和回退

通过当前宿主允许的浏览器打开精确正式 URL，验证图片自然尺寸/可见、懒加载与失败占位、主要交互、预览关闭恢复及关键下载入口。浏览器解码与HTTP完整字节是两项，默认域的下载头不能单独判断 img 成败；浏览器未测就明说。

若目标是提速，用相同版本内容、网络/设备/视口/缓存条件有限次对照，分别记录入口、列表、封面和点击后真实交互就绪。页面快照及图片字节变小不等于某地区速度已改善。不要加轮询监控、扫描器或定时重试。

有旧版本时，必要回退可在精确授权目标使用：

```bash
wrangler rollback OLD_VERSION --config RELEASE/wrangler.json --yes --message "restore verified static version"
wrangler deployments status --config RELEASE/wrangler.json --json
node "$SKILL_DIR/scripts/site.mjs" verify OLD_RELEASE https://site.example.org
```

读回旧 UUID、完整旧文件并复验关键交互。旧版本必须仍可用；平台回退不可用时用保存的旧完整快照重新上传/激活，不能重新构建“相似版本”冒充同字节回退。没有旧版本的首次发布不承诺回退；保留首版快照供后续使用。不用 sync --delete、删共享桶或清理其他前缀回退。

交付精确 URL、活动版本、清单、已验证项及回退版本。跨项目复用、跨账号成功、跨地区速度分别取证；单账号 fixture 通过不能代表其他使用者已经完成配置。

官方依据：[Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Headers](https://developers.cloudflare.com/workers/static-assets/headers/)、[Versions & Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/)。CLI 参数以当前项目版本帮助为准。
