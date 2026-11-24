# 三站关键词卡片读取工具

仅在用户目标已经明确为抖音、小红书、B站的关键词搜索、需要少量卡片时读取。热点、推荐、作者、合集或讨论先沿 [站点目录](sites/index.md) 选择对应操作。

## 执行知识的唯一来源

先读取 ego-ops 的站点索引，再按目标读取原文；下列身份保留现有 site/operation：

| site | 关键词搜索原文 |
|---|---|
| douyin | ego-ops:douyin/search-public-results |
| xiaohongshu | ego-ops:xiaohongshu/search-public-notes |
| bilibili | ego-ops:bilibili/search-public-videos |

通过 catalog get 精确身份可定位当前原文。搜索 URL、选择器、等待条件、签名处理、页面陷阱与验证日期继续在 Ego OPS 维护；本文件不保留第二份站点步骤。

## 工具调用边界

scripts/ego-channels.mjs 是接受现有受控 Ego Page 的有限卡片读取工具，提供 search(page, site, query, {limit, timeout}) 与 readVisible(page, site, {limit})。它不启动或选择浏览器、不创建任务空间、不负责登录、捕获、报告或收尾，这些仍由当前 Ego 运行时管理。

在已获当前任务空间的同一个 ego-browser nodejs round 中，从本次实际安装目录 import 此模块。默认3条、最多10条；只返回当前渲染卡片的标题、规范链接和已确认作者，不代表全部搜索结果、正文或评论。

三个关键词工具不能用于热榜、作者页或评论。需要这些目标时直接执行所选 Ego operation；页面改变使工具合同失效时按当前证据修复工具，不在这里扩写第二套经验。
