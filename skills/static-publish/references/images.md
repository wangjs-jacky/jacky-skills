# 选定图片的派生

图片是实际瓶颈且用户允许生成派生资源时读取。封面按显示尺寸与 DPR 选宽度；背景和卡片分别处理，先试代表样本。原图、下载包、动图及业务语义需要保留。

```bash
node "$SKILL_DIR/scripts/doctor.mjs" publish.json --images
node "$SKILL_DIR/scripts/images.mjs" public/original.png public/cover.webp --width 640 --quality 82 > cover-derivation.local.json
```

输出目录需存在，输出必须是新文件；接受 PNG/JPEG/WebP，保留比例，按明确宽度重采样。小图不应盲目放大；动画、SVG、透明效果和文字清晰度需另判断，默认不批量转。脚本使用真实 cwebp 编码，报告原件/结果完整 SHA、字节、变换参数和 recommended。`recommended: false` 表示字节未减少，应比较后另选参数或保留原图。

派生记录可含本机输入输出路径，放在公开目录外；它不是云凭据配置，也不随页面发布。压缩后的新文件才写入资源配置 files；用资源清单生成最终 URL，不手拼摘要。参数或源图变化时用新派生输出名；同字节内容会复用相同云 key，旧版本文件不删除。

检查浏览器实际解码、裁切/透明度和可读性，再接入页面。对于图集可将列表改静态封面、点击才创建一个同源 iframe；这是网站实施步骤，需要保留真实预览、错误恢复、键盘/触摸和减少动态行为。生成截图时遵循当前宿主浏览器规则；本工具不自带浏览器截图器。
