# Image Effects 全量效果目录设计

> 本文记录八效果首版基线。后续语义迁移的实时效果集合以 `skills/image-effects/references/INDEX.md` 为准；首版的来源、许可、版本化与静态 Gallery 契约继续有效。

> 日期：2026-08-18 ｜ 状态：规格已批准，实施已完成并通过本地与 GitHub 检查，待合并后公开发布

## 一、目标

在现有 `image-effects` Skill 与静态 Gallery 的基础上，迁移 Happy「GitHub Skills」分类中除 `grade-images` 以外的全部生成式图片效果。交付后，用户只需安装一次 `wangjs-jacky/image-effects`，即可浏览并调用 8 个稳定、带版本的效果，不需要再安装上游 Skill 或处理额外 Skill 依赖。

完成后的固定效果集合为：

1. `healing-anime-scribble-v3@1.0.0`（保留现有实现）
2. `photo-illustration-editorial-echo@1.0.0`
3. `photo-illustration-diptych-lakeside@1.0.0`
4. `photo-illustration-diptych@1.0.0`
5. `scenes-gathered-zine-sea@1.0.0`
6. `scenes-gathered-zine@1.0.0`
7. `scene-distillation-zine@1.0.0`
8. `minimal-zine-poster@1.0.0`

每个新增效果都必须同时满足两条交付线：

- **Skill 可执行**：效果卡包含完整行为，不依赖本机另装上游 Skill；宿主能力不足时明确降级，不伪造成功。
- **Gallery 可浏览**：效果拥有独立、无用户素材和第三方图片来源风险的预览，公开来源、作者、许可证与版本化调用语句完整可见。

## 二、本次范围与非目标

### 2.1 本次范围

- 扩展 `skills/image-effects/` 的效果卡、解析器、Skill 入口、Gallery 模型、构建器、公开说明与测试。
- 新增 7 张独立生成的预览，并对最终文件去除元数据、记录尺寸与 SHA-256。
- 保留上游作者、固定提交、逐文件哈希、许可证链接、完整 MIT notice 与适配说明。
- 从合并后的 `jacky-skills/main` 单向导出到公开仓库 `wangjs-jacky/image-effects`。
- 更新并验证 GitHub Pages Gallery。

### 2.2 明确排除

- 不集成 `grade-images`，也不迁移任何确定性调色、批处理、recipe 或质量报告能力。
- 不修改 Happy App，不接入远程目录、插件加载器、OSS/CDN 或 OTA。
- 不把每个效果拆成独立 Skill。
- 不加入在线生图服务、账号系统、后端、额度或用户图片上传。
- 不使用旧 Gallery 示例、历史用户附件、真人照片、品牌素材或第三方预览图作为新增预览。

## 三、事实源与发布边界

唯一开发事实源保持为：

```text
jacky-skills/skills/image-effects/
```

公开仓库保持为：

```text
https://github.com/wangjs-jacky/image-effects
default branch: main
Pages: https://wangjs-jacky.github.io/image-effects/
```

实现使用独立 sibling worktree；`jacky-skills` 原始工作区中的用户改动不得被清理、覆盖或混入。发布顺序固定为：源仓库分支提交与 PR → 检查通过 → 合并 `jacky-skills/main` → 从合并提交导出 → 公开仓库提交与推送 → Pages 检查。禁止从未合并分支直接发布公开仓库。

## 四、效果目录与来源固定点

新增效果的行为来源固定如下。`source_paths` 与 `source_sha256s` 继续逐项对应；实现时同时固定对应仓库 `LICENSE` 文件，使在线校验可以验证行为文件和许可证文件的真实字节。

| 效果 | 固定来源 | 行为路径与 SHA-256 | 许可证/适配 |
|---|---|---|---|
| Editorial Echo | `wangjs-jacky/happy@e8716a0a0c949f8e2b45e1e3d7c8d36ad7bba17c` | `packages/happy-app/sources/components/agents/photoIllustrationEditorialEchoPrompt.ts` · `66a172d31b3af5c54a22e28adb15432ea25a2fe895d87b6e443451516ad749a3` | MIT，Happy Coder Contributors；保留两阶段生成与排版流程 |
| Lakeside Minimal Diptych | `wangjs-jacky/happy@fa6c30497d01b077d7d4d58e1a4c00bca4c38fcd` | base `photoIllustrationDiptychPrompt.ts` · `630058159d094f6db71e7679b2d5b3f471bcb6e8f3dbccd38fa47841ec900a00`；specialization `photoIllustrationDiptychLakesidePrompt.ts` · `040de02ecfb6658a8276cc96c3127078810da4b16c230c167951e09394d5b8d8` | MIT，Happy Coder Contributors；说明 base 最初固定于 `532e49bb711283cbe2738439039298f9cea1ef7b`，此处采用同时包含 specialization 的提交 |
| Photo–Illustration Diptych | `wangjs-jacky/happy@532e49bb711283cbe2738439039298f9cea1ef7b` | `packages/happy-app/sources/components/agents/photoIllustrationDiptychPrompt.ts` · `fd78d07b3b36446e88c4b073e38d948642e40c4ffd3c8954b29b704f44909934` | MIT，Happy Coder Contributors；Happy 原创适配 |
| Gathered Scenes Zine · Sea | `Zeejay0/gathered-scenes-zine-skill@e764b7fd243d7cc501723b9d325279bf6dd852c2` | `skills/scenes-gathered-zine-v1-3/SKILL.md` · `665b4be2cc54830f4ef489f0290e21f0eb123b70b1922bca4cdddf9e5b2eb670` | MIT，Gathered Scenes Zine contributors；Sea 是同一编译器的海岸场景 specialization |
| Gathered Scenes Zine | 同上 | 同上 | 同上 |
| Scene Distillation Zine | 可验证镜像 `Zeejay0/gathered-scenes-zine-skill@e764b7fd243d7cc501723b9d325279bf6dd852c2` | `skills/scene-distillation-zine-v1-3/SKILL.md` · `088116c2bbf70b4891e5ece8191ed729d6e8074555895df2c16780ebd5800fbc` | MIT，Gathered Scenes Zine contributors；适配说明同时保留原坐标 `Zeejay0/scene-distillation-zine-v1-3@921390baac518c85d60a6d98709f1dd657eec720`，原仓库当前 404 时以同作者公开镜像做在线字节验证 |
| Minimal Zine Poster | `LiamGvchi/gc-minimal-zine-poster@4cb0396ad4e834019f753b37e1c4f415f5e02026` | `SKILL.md` · `d4e1199623ee4d98e948189308eedc601f83ab0ae923568c6e9240f89c783b8b` | MIT，Copyright (c) 2026 LiamGvchi |

`THIRD_PARTY_NOTICES.md` 必须继续由机器生成。新增 `references/licenses/` 保存从上述固定提交复制的完整 MIT notices；效果卡通过规范相对路径引用 notice。构建器按内容 SHA 去重许可证正文，并为每个效果输出作者/版权行、仓库、revision、行为路径哈希、许可证 URL 与适配说明。公开根 `LICENSE` 只覆盖本项目原创代码和适配，不重新许可第三方材料。

## 五、效果卡机器契约扩展

现有严格 simple-scalar frontmatter 保留。为支持完整目录，枚举扩展为：

```text
category: portrait | editorial | zine
execution_kind: host-image-generation | host-image-generation-and-layout
input_mode: image | text-or-image
```

约束如下：

- `input_mode: image`：`input_min: 1`、`input_max: 1`、`input_formats: jpeg,png`；当前请求必须恰好一张明确附加的 JPEG/PNG。
- `input_mode: text-or-image`：`input_min: 0`、`input_max: 1`、`input_formats: jpeg,png`；零图片时必须存在非空文字主题，一张图片时可附加文字方向，超过一张图片仍拒绝。
- `host-image-generation`：交给宿主原生图片生成/编辑能力，最多一次针对硬失败的定向重试。
- `host-image-generation-and-layout`：先做能力预检，再执行图片生成和本地排版两个阶段；任何阶段都不能被静默跳过。
- `output_count` 本次全部为 `1`。
- `source_license_spdx` 本次继续只允许 `MIT`；`preview_license_spdx` 继续只允许 `CC-BY-4.0`。
- 新增 `source_license_notice`，必须是 Skill 内 `references/licenses/` 下的规范相对路径；notice 必须与固定来源的 LICENSE 字节一致。

效果卡正文继续要求六个二级协议标题：适用场景、输入契约、视觉编译规则、硬性禁止项、质量检查、交付要求。效果的完整编译规则迁入效果卡，不以摘要、链接或“请另装某 Skill”替代。

## 六、Skill 执行设计

### 6.1 通用解析与隐私

1. 解析精确 `<id>@<version>`；未知版本不自动替换。
2. 没有指定效果时，只读生成的 `references/INDEX.md`，最多推荐 5 个。
3. 只读取被选中的效果卡。
4. 按 `input_mode` 检查当前请求；不扫描附件目录、历史消息或相邻文件猜测输入。
5. 用户图片只作为当前任务的宿主输入，不进入仓库、Gallery、日志、预览或来源元数据。
6. 临时文件仅在宿主传输或排版需要时创建，成功或失败后都清理。
7. 同一效果最多一次定向重试；不同效果之间不建立全局锁或队列。

### 6.2 六个单阶段图片效果

Healing、两个 Diptych、两个 Gathered Scenes 和 Scene Distillation 都要求一张当前请求图片。Skill 将选中卡片的完整规则、用户目标和该图片交给宿主原生图像工具。无兼容图像工具时返回完整可复制 Prompt，并明确没有生成图片。

### 6.3 Minimal Zine 的双输入模式

Minimal Zine 接受以下二选一：

- 非空文本主题，零图片；
- 一张明确附加的 JPEG/PNG，可附加文字方向。

纯文本时从主题提炼一个可成像隐喻；图片模式保留主体与情绪线索，但把图片降为小型纸面锚点。两种模式都生成一张 3:5 海报，并遵守一处高饱和色、70%–90% 纸面留白等硬规则。

### 6.4 Editorial Echo 的两阶段流程

Editorial Echo 使用 `host-image-generation-and-layout`，流程固定为：

1. **预检**：在生成任何中间资产前，确认宿主同时具备图片生成能力和本地 HTML/CSS 或等价确定性排版后栅格化能力。
2. **Stage A**：仅生成隔离的水彩/墨线 illustrated echo，不让图片模型生成最终海报、照片面板或文字。
3. **Stage B**：把用户原图作为真实矩形 photo anchor，与 generated motif、真实 HTML 文本、规则线和色卡在固定尺寸页面中排版；用浏览器截图或等价确定性栅格器输出最终图。
4. **质量门**：文字必须清晰可编辑、无浏览器边框或滚动条；原图不重绘；motif 不是第二个矩形照片；排版失败只修复并重截，不重新生成已合格 motif。
5. **降级**：缺少任一必需能力时，在生成前停止，返回完整 motif prompt、构图尺寸、Copy Map、HTML/CSS 排版计划和缺失能力说明；不得只交付 motif 或声称最终海报完成。

该流程不依赖 `grade-images`、外部 Skill 或额外仓库。宿主能力是执行前提，不是安装依赖。

## 七、Library 与 Gallery schema

公共 Library 升级为 `schemaVersion: 2`。每个 effect 在现有字段基础上增加：

```json
{
  "executionKind": "host-image-generation",
  "previewWidth": 1024,
  "previewHeight": 1536,
  "input": {
    "mode": "image",
    "min": 1,
    "max": 1,
    "formats": ["jpeg", "png"]
  }
}
```

`executionKind`、`previewWidth` 与 `previewHeight` 成为公共必填字段；尺寸来自预览文件的完整像素解码结果，Gallery 必须用它们生成图片的 `width` / `height` 属性，不能继续硬编码旧预览比例。Gallery runtime 必须拒绝 schema 1、非法尺寸或字段不完整的数据，并显示安全的可重试错误。`invocation` 按输入模式生成：

- image：`Use $image-effects effect <ref> on my uploaded image.`
- text-or-image：`Use $image-effects effect <ref> with this idea or my uploaded image.`

Gallery 增加 `portrait`、`editorial`、`zine` 的中英文分类标签。搜索、筛选、多选、复制、主题、URL 往返、版本化 DOM ID 和相对 URL 契约保持不变。构建结果必须稳定按 ASCII `id` 与 SemVer 排序，8 个 ref 不重复。

## 八、七张独立预览

七张新增预览分别生成，不复用旧效果图，也不把某一张预览当作另一效果的输入。每张使用独立的虚构主题与独立最终提示，避免出现真人身份、用户图片、品牌、商标、可识别作品角色或第三方摄影内容。Editorial Echo 可在同一次效果制作中生成无现实来源的虚构 photo anchor 与 motif，再由本地 HTML/CSS 合成最终预览；其工作资产不进入公开 Gallery。

建议内容分配用于降低视觉重复：

| 效果 | 独立虚构主题 | 方向 |
|---|---|---|
| Editorial Echo | 无品牌胶片相机与窗边影子 | 3:5 |
| Lakeside Minimal Diptych | 无人物的弧形栈道、静湖与小舟 | 3:5 |
| Photo–Illustration Diptych | 山间旧水车与步道 | 3:5 |
| Gathered Scenes Zine · Sea | 海岸栏杆、远处渡船与风 | 5:3 |
| Gathered Scenes Zine | 温室、长椅与攀援植物 | 3:5 |
| Scene Distillation Zine | 雨夜公交站的伞与倒影 | 3:5 |
| Minimal Zine Poster | “留一小段安静”文字主题与纸片月相 | 3:5 |

生成后统一通过锁定版本 `sharp` 重编码为 PNG 或高质量 JPEG，移除 EXIF、XMP、文本块、GPS、设备和任意尾随元数据；随后记录最终文件 SHA-256、尺寸、`preview_origin`、`preview_author: wangjs-jacky` 与 `preview_license_spdx: CC-BY-4.0`。`preview_origin` 明确写出“text-only generation of a fictional scene”或 Editorial Echo 的本地合成事实。

## 九、测试驱动实现

所有协议变化先写失败测试并实际观察红灯，再做最小实现。开发期间使用定向测试；最终验收再跑完整套件。测试至少覆盖：

1. 恰好 8 个固定 refs，`grade-images` 不存在。
2. `category`、`execution_kind`、`input_mode`、基数和格式的合法组合与非法交叉组合。
3. Minimal Zine 零图片时要求非空文本；图片模式最多一张。
4. Editorial Echo 必须在 Stage A 前预检 layout；缺 layout 的降级内容完整且不声称生成成功。
5. 许可证 notice 路径、字节哈希、去重与 `THIRD_PARTY_NOTICES.md` 确定性生成。
6. 每张预览可完整像素解码、尺寸有效、SHA 匹配且元数据干净。
7. 每张预览的作者、CC-BY-4.0 与无现实来源声明完整。
8. Library schema 2、`executionKind`、真实预览尺寸、条件 invocation、分类翻译与 8 个 artifact URL。
9. INDEX、Library、Notice、media、source 与公开导出在固定 epoch 下逐字节可复现。
10. 静态 HTTP 下页面、Library、8 张图片和 8 份源码卡全部返回正确状态与 MIME。
11. 桌面和移动视口中 8 张卡片可浏览，筛选、搜索、选择与复制可用，无横向溢出或遮挡。

现有完整基线已在独立 worktree 上通过：`node --test skills/image-effects/tests/*.test.mjs`，共 365 项、0 失败。该全量套件约 20 分钟，最终回归必须重新执行，不用旧输出替代。

## 十、验收、合并与发布

本地发布门固定为：

```bash
python3 "$HOME/.codex/skills/.system/skill-creator/scripts/quick_validate.py" skills/image-effects
node --test skills/image-effects/tests/*.test.mjs
node skills/image-effects/scripts/validate-effects.mjs --online
SOURCE_DATE_EPOCH=1787011200 node skills/image-effects/scripts/build-gallery.mjs
git diff --exit-code -- skills/image-effects
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/audit_skills.py --scan-shared-content
bash -n install.sh
claude plugin validate --strict .
```

此外必须：

- 用真实本地 HTTP 检查 Gallery 与全部相对资源；
- 用浏览器验证桌面和移动视口；
- 检查工作树没有意外文件或私有路径；
- 创建源仓库 PR，等待 GitHub 检查完成并自审 diff；
- 检查通过后合并，不 force push；
- 从合并后的 `origin/main` 干净 worktree 执行公开导出和 `--check`；
- 在公开仓库提交、推送，等待 Pages workflow 成功；
- 最后用 HTTP 与浏览器验证公开 Gallery、8 个效果、安装命令和资源 URL。

任一来源、许可证、哈希、预览、测试、PR 检查、导出、Pages 或线上资源验证失败，都停止发布并保留可诊断状态；不绕过检查，不把部分交付描述为完成。

## 十一、完成定义

只有以下条件全部成立，任务才算完成：

- `jacky-skills/main` 已合并包含完整 8 效果目录的 PR；
- 7 个新增效果可按各自输入和执行契约运行或诚实降级；
- 7 张新增预览全部独立、无来源风险、元数据干净且 SHA 锁定；
- 作者、固定来源、完整许可证 notice 与适配说明可从效果卡和公开 Notice 追溯；
- Gallery 的 8 张卡片在桌面与移动端均通过验收；
- `wangjs-jacky/image-effects/main` 已由合并后的源提交导出并推送；
- GitHub Pages 已成功更新，公开 URL 与全部资源实际可访问；
- 最终报告给出源 PR、合并提交、公开仓库提交、Pages URL 和各验证门结果。
