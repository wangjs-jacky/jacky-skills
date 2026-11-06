---
name: static-publish
description: "用于带图片、字体、媒体或下载资源的静态网页发布、Cloudflare Workers Static Assets 上线与回退、复用已有 OSS Bucket，以及首次配置自己的云账号。也适用于无需 OSS 的同站静态资源发布；不承接多人共用运营方账号的托管平台。"
---

# 静态网页与资源发布

每个人使用自己的官方 CLI 身份，资源和费用归本人。先复用已有目标与桶；不同项目以独占前缀组织，不每次发布建桶。无需 OSS 的网页直接走同站分支。首版页面平台为 **Cloudflare Workers Static Assets**；其他平台沿项目原有流程，不承诺完整自动适配。

## 按当前任务读取

- 使用者安装、最短首发、日常管理和升级：入口为[使用说明](README.md)。不要让新用户先写 JSON；Agent 盘点后生成当前必要配置，账号交互由用户完成。
- 首次使用、缺工具/账号/桶/权限，或 OSS 域名与备案问题：读[接入条件](references/onboarding.md)。先检查现有条件，只引导当前缺的一步。
- 大图需要减重：读[图片派生](references/images.md)。只转换选定图片，保留原件；图集截图与点击才建 iframe 是可选网站改造，不自动改写任意网页。
- 页面发布、版本激活、验收或回退：读[发布流程](references/release.md)。生成独立公开快照，先上传依赖，再切页面版本。

当前宿主要求的 Cloudflare/Aliyun/发布 OPS 优先适用。需要浏览器时使用宿主允许的工具；本机有 Ego 治理规则时先 ego-ops 再 ego-browser。缺浏览器只交字节验证，不声称已通过解码或交互。共享 Skill 不依赖作者机器、账号、私有路径或其他私有 Skill。

## 工具与依赖

从当前安装入口解析本 Skill 实际目录为 `SKILL_DIR`。基础工具用 Node.js 22+ 标准库，无 npm 包依赖；仅相应分支需要已安装的 Wrangler、Aliyun CLI 或 cwebp。使用项目锁定的官方 CLI，不静默安装、不切换全局账号、不索要聊天中的长期密钥。

| 命令 | 用途与结果 |
|---|---|
| `node "$SKILL_DIR/scripts/doctor.mjs" --preflight [--oss] [--images] [--wrangler CLI]` | 无配置本地依赖检查，不认证、不安装、不查云 |
| `node "$SKILL_DIR/scripts/doctor.mjs" CONFIG [--auth] [--images] [--wrangler CLI]` | 本地依赖/公开文件检查；`--auth` 单次查 CLI 身份或精确 OSS 对象，不查列桶、不证明写权限 |
| `node "$SKILL_DIR/scripts/project.mjs" init NEW_DIR --public-dir DIR --name WORKER --file index.html [--file FILE ...]` | 在公开根外生成项目入口与 site.json；拒绝覆盖与漏引用 |
| `node "$SKILL_DIR/scripts/project.mjs" status PROJECT` | 查看本地发布历史；不保证当前云状态 |
| `node "$SKILL_DIR/scripts/project.mjs" record PROJECT EVIDENCE_JSON NEW_NAME` | 保存绑定快照、实际版本/字节证据摘要及旧版关系的不可覆盖回执；不查云 |
| `node "$SKILL_DIR/scripts/images.mjs" INPUT NEW.webp --width 640 --quality 82` | WebP 派生及原件/结果摘要、参数、节省字节记录；不覆盖 |
| `node "$SKILL_DIR/scripts/resources.mjs" plan CONFIG` | 精确资源、类型、字节、完整内容地址 |
| `node "$SKILL_DIR/scripts/resources.mjs" prepare CONFIG OUTPUT` | 资源快照及 `<prefix>/assets-manifest.json` |
| `node "$SKILL_DIR/scripts/resources.mjs" render MANIFEST TEMPLATE.html NEW_OUTPUT.html` | 只替换显式 `{{asset:source}}` 占位符；不覆盖、不重写任意网页 |
| `node "$SKILL_DIR/scripts/resources.mjs" publish CONFIG --apply` | OSS 精确对象上传/复用并匿名核验；不建桶或改旧权限 |
| `node "$SKILL_DIR/scripts/resources.mjs" verify CONFIG [--origin https://site.example.org]` | 资源完整 GET、类型、字节和 SHA；不证明浏览器/CORS |
| `node "$SKILL_DIR/scripts/site.mjs" plan SITE_CONFIG` | Cloudflare 页面公开集合、路径/摘要及缓存检查 |
| `node "$SKILL_DIR/scripts/site.mjs" prepare SITE_CONFIG NEW_RELEASE` | 新建不可覆盖的页面快照、受限缓存规则、Wrangler 配置及私有清单 |
| `node "$SKILL_DIR/scripts/site.mjs" check RELEASE` | 发布前拒绝新增、缺失、变化文件和控制配置变更 |
| `node "$SKILL_DIR/scripts/site.mjs" verify RELEASE https://site.example.org` | 精确页面及同站依赖的字节/类型/缓存；活动版本另由官方 CLI 读回 |

脚本不会自动部署页面。Agent 按发布流程使用官方 Wrangler 执行候选上传、前提复核、激活、活动版本读回和回退；这样无需再维护一套云控制接口。配置 JSON 用于确定性解析，不含 AccessKey、Token、签名 URL 或任意 Shell 命令。

## 资源配置

资源路径相对配置文件，与调用 cwd 无关。只列本次选定公开文件，不递归上传整个工作区。

```json
{
  "version": 1,
  "publicDir": "./public",
  "files": ["covers/card.webp"],
  "storage": {
    "provider": "oss",
    "bucket": "example-web-assets",
    "region": "cn-shanghai",
    "prefix": "my-project",
    "publicBaseURL": "https://example-web-assets.oss-cn-shanghai.aliyuncs.com"
  }
}
```

同站模式的 storage 只需 `provider: "same-origin"`、`prefix`、`publicBaseURL: "/assets"`；不需要 Aliyun。可选 OSS `profile` 仅引用已有 CLI 身份名。首次配置、默认域名限制及同站完整例子见接入条件。

## 执行与完成依据

1. 缺配置先做 doctor --preflight，Agent 审阅公开范围后用 project init 生成最少配置；已有配置直接复用。核对账号、已有页面目标与可选桶，再运行 doctor/plan。配置可读、登录可读、对象可读及写入成功分别判断，不能把 ready 当作云发布成功。
2. 按实际显示尺寸生成必要派生资源；截图需等页面真实就绪，记录取景与版本。通过资源清单 source→publicURL 接入构建，保留业务 ID/来源与下载原件。
3. OSS 先 publish 并核验所有依赖；同站把 prepare 输出纳入页面的显式 files。保留依赖 iframe DOM 的 HTML 同源，图片可以独立分发；CORS 不提供跨域 iframe DOM 权限。
4. site plan/check 会检查常见字面 HTML/CSS 引用，不分析全部动态 JS；按输出补浏览器核对。超过25 MiB不能用同站兜底，文件数按已确认套餐检查。依发布流程冻结并上线，失败保留旧页面和旧资源；只回退完整版本，不删除共享桶或其他前缀。
5. 读回活动版本、完整文件字节，再验浏览器图片解码及主要交互。提速目标需相同条件前后测量，分别报告列表、封面和点击后真实交互就绪；没有测量不声称提速。

不引入业务状态轮询、定时扫描或循环重试；失败停在当前阶段，修复后由明确动作重跑。上传不等于上线，HTTP200不等于字节正确，图片出现不等于动效就绪，单机成功不等于国内访问速度。

交付实际 URL、版本、清单及回退入口；通过 project record 保存本地证据回执，字节核验不代替活动版本读回/浏览器，记录命令本身不查询云。分别说明账号/建桶、资源、页面、浏览器、性能哪些完成。说明当前验证账号、地域和路径边界，不能把单账号样本包装成跨账号验证。
