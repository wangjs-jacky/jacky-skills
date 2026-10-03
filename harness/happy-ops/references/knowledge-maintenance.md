# 经验维护与自我沉淀

读取路径是总索引 → 一个 system → 一条 operation；需要本机值时才加载该系统私有索引和该操作证据。

## 唯一归属

| 内容 | 归属 |
| --- | --- |
| 跨操作共识、操作路由与共性陷阱 | references/systems/<system>/index.md |
| 一个目标的方法、检查点、成功标准与恢复 | references/systems/<system>/operations/<operation>.md |
| 本机环境与核实入口 | local/systems/<system>/index.md |
| 对应操作的私有参数、证据指针 | local/systems/<system>/operations/<operation>.md |
| 具体执行结果、失败观察 | local/records/ 的唯一记录 |
| 历史原文与恢复快照 | local/history/、local/archive/，不可变 |

## 写回闭环

1. 执行前选择 operation，读其状态与 scope；superseded 跟随替代链接，historical/pending 必须实时复核。创建/修改条目先读[操作约定](schemas/operation.md)，新系统或共用事实变化再读[系统约定](schemas/system-index.md)。
2. 真正成功后，将具体证据写到私有记录，更新对应操作的 last_verified、scope、证据指针和 status，再同步公共及私有系统索引。重复成功也更新验证记录；没有新知识时不改步骤正文，不复制另一套 SOP。
3. 只有部分路径成功时缩小 scope，未覆盖项保留。合并、构建、上传、激活、页面、手机加载与真实模型响应分别表述。
4. 未完成不能刷新成功日期。将观察与待查点写入私有记录；只有根因与恢复都被验证后，才加入操作失败恢复段。查阅没有新事实不制造更新。
5. 操作失效时改 status 并同步索引；被替代时设置 superseded 和 replacement。下一次路由读取这个状态，避免继续默认使用旧结论。
6. 跨操作结论归系统索引，其他内容回写原 operation。历史归档不改正文，只在操作证据中更正并链接新记录。
7. 运行知识校验器，修复身份、字段、索引、链接、隐私及迁移覆盖错误后，才能声明已沉淀。校验不能证明实际执行成功，也不能检测全部秘密。

## 历史迁移与兼容

所有原始分片保持字节与顺序，migration.json 及原始快照继续验证。operation-migration.json 为全部历史及迁移时新增记录登记稳定 operation 归属；校验来源哈希和证据可达性，避免只搬目录而漏记案例。历史条目不批量提升为 verified。

旧 local/topics 是检索入口，不再维护新 SOP。experience.local.md 只留短指针；旧调用方追加正文时先迁入 records、关联操作，再缩回。新执行记录无需加入不可变迁移清单，但必须由操作证据索引链接。修改前比较源文件，发现并发变化先合并，不覆盖。

旧公共手册保留短跳转以兼容外部引用：[Web](release-web.md)、[OTA](release-ota.md)、[CLI](release-cli.md)、[Server](release-server.md)；正文与验证日期只有新 operation 一处维护。

## 隐私与授权

公开文件不保存真实主机、账号、路径和具体部署标识，local 必须被 Git 忽略。不保存密码、token、Cookie、私钥、可重放凭据。自动沉淀不自动 commit/push、部署或更改服务；不修改其他 Skill。
