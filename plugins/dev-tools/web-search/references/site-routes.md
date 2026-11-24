# Ego 站点路由

处理抖音、小红书、B站搜索或已有网页内容时读取。先完成 `ego-ops → 当前站点 operation → ego-browser`，遵循当前 `ego-browser skill` 的 API 和控制权；本文件仅补充搜索 URL 与有限结果提取。

## 统一入口与范围

| site 标识 | 搜索入口 | 内容边界 |
|-----------|----------|----------|
| `douyin` | `https://www.douyin.com/search/<编码关键词>` | 当前真实渲染视频卡片；标题、作者和视频 URL 必须来自页面 |
| `xiaohongshu` | `https://www.xiaohongshu.com/search_result?keyword=<编码关键词>&source=web_search_result_notes` | 当前真实渲染笔记卡片；只输出无签名的 canonical note URL |
| `bilibili` | `https://search.bilibili.com/all?keyword=<编码关键词>` | 当前真实渲染视频卡片；排除直播/课程等不同类型 |

三个站点均直接用 Ego，不调用站内私有 JSON、签名/WBI接口、bili-cli、下载/转录工具或其他浏览器采集框架。当前不支持 LinkedIn。其他网页（包括需要的雪球网页）沿 Ego 普通探索与知识写回流程，不能套用这些站点选择器。

## 在现有任务空间调用

运行时先给出本轮确切任务空间与 Page、目标和必要的 Happy 报告/捕获上下文；沿 Ego guide 接续并取得当前受控 `page` 后，再在**同一个 nodejs round** 中调用：

```js
const { search, readVisible } = await import("/absolute/loaded-skill/scripts/ego-channels.mjs");
console.log(await search(page, "xiaohongshu", "关键词", { limit: 3, timeout: 15000 }));
// 已在需要的结果页时只读取：
// console.log(await readVisible(page, "xiaohongshu", { limit: 3 }));
```

将绝对模块路径替换为实际加载目录；不要依赖 shell 环境变量传入 Ego 的 Node 运行时。函数不启动/选择浏览器、profile 或任务空间，不取得其他用户标签页，不负责登录、截图、报告或 finish；这些仍由本轮 Ego 运行时负责。模块只使用传入 Page 的现有 Ego API。

默认少量结果（建议 3 条，最多 10 条）足以核对质量，再按用户需求扩展。同一目标复用任务空间和 Page；观察就绪状态并做一次有上限等待，不固定 sleep、不循环搜索、不全页转储。验证页、登录页、用户接管或缺失内容应报告并按 Ego guide 处理，不尝试绕过。

## 页面合同与结果

小红书以实际渲染的 `section.note-item` 为卡片；必须等 `.title` 有真实文本且笔记链接存在，只有图片/空卡片不算就绪。作者取 `.author .name`，不能用包含日期的整个 `.author` 文本。页面可能追加 `type=51`，只要同站搜索路径和 keyword 正确即可。

小红书真实卡片 href 可能带 `xsec_token`。输出仅使用从真实链接 pathname 取得的笔记 ID 生成 `https://www.xiaohongshu.com/explore/<id>`，不返回、记录或持久化签名参数。确需进入笔记时重新观察当前 DOM 并在该 Page 内点击当下链接；canonical URL 不是登录可用性或永久直达保证。

B站以包含 `h3` 的真实 `bilibili.com/video/BV...` 链接提取视频标题和 canonical 视频 URL。未在页面明确找到作者就返回 null，不猜作者、不从内部接口补齐。

抖音当前合同为 `.videoImage` 的父卡片：卡片自有 `__reactFiber$` 向上最多 12 层，读取同卡片 `memoizedProps.data.awemeInfo`；只接受 19 位字符串 `awemeId`、非广告、且 desc 前缀确实出现在该卡片已渲染文本的结果。作者优先使用同卡片可见的 authorInfo 名字，否则仅取可见 @作者行。就绪等待使用同一检查，不能只等不存在的 video anchor。这里读取的是当前页面已渲染卡片的组件字段，不请求站内 API、不猜 ID。选择器变化或数据不足时保留已取得项并报告缺口。

结果应包含站点、可核对的无签名当前页 URL、少量规范化 `title/url/author` 与实际提取范围；它只是当前渲染的结果，不保证全站排序、全文、全部评论或完整历史。任何截图、snapshot 或报告输出前须避免/清除签名链接、Cookie 和其他可重放凭据；不要为排障直接打印整页 DOM、hydration 或网络响应。

## 真实验收与写回

每个实际操作在原任务空间验证 URL、可见标题与来源，再由本轮运行时保存必要截图/捕获和 Happy 报告。成功、失败或中断后按 `ego-ops` 的规则维护唯一站点 operation/索引和校验结果；未成功不刷新成功日期。单元测试不替代这些真实页面验收。
