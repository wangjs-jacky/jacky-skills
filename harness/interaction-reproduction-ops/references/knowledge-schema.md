# 知识与自动写回

## 元数据与证据范围

effect使用scene、effect、status、last_verified及verification_scope。operation使用scene、operation、status与last_verified。documented为未实测指导，partial为部分路径已验证，verified为声明范围的成功条件都有真实证据；前两者last_verified为null，verified填真实本地日期并在正文注明范围。source-example只证明来源示例，reuse-example说明具体跨页面复用，不能据此宣传任意页面均成功。

共享正文不保存机器绝对路径、凭据、截图临时标识或私有业务内容。公共原视频链接可作来源，原片/原截图/完整转写与项目记录留private项目；自写复用提示词明确标注。

## 写回顺序

1. 对照本次operation成功标准，判断完整、部分、失败或无新增。
2. 更新唯一effect正文/operation；当前证据推翻旧结论时修正或降级，保留历史范围，不只追加矛盾段落。
3. 同类新效果沿既有scene归属，跨场景引用，不复制正文。重复成功刷新对应真实日期，内容无新事实不重复追加。
4. 同步场景/薄catalogue的必要身份与路径；网页是从方法正文编译的展示，不能手改派生页面作为知识更新。
5. 跑scripts/validate-library.mjs，并检查相关相对链接和共享隐私。结构通过不等于实际交互验证；有新/改脚本需真实运行。
6. 报告实际写回文件、证据、未验证范围。写入失败或只读则报告未沉淀，不能另建数份漂移副本。

本协议不会自动提交/推送、部署或发起额外业务；不创建后台扫描/状态轮询。
