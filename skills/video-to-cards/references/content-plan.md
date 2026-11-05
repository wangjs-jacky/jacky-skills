# 选段计划

`plan.json` 只是选字幕与截图的机器接口，不接受自由撰写正文。

```json
{
  "cards": [
    {
      "id": "method-7",
      "visual": {
        "time": 42.5,
        "role": "speaker",
        "reason": "对应这段原话的实际发言者"
      },
      "blocks": [
        { "evidence": ["s0012", "s0013", "s0014"] }
      ]
    }
  ]
}
```

替换为当前视频中实际存在的ID和时间。字幕只从 `transcript.json` 按ID读取，不能另外填写 `text`、`quote`、`heading` 或卡片 `title`、`subtitle`、`takeaway`。

- 一张长图对应一组原话。每个block叠加一段字幕，多block按顺序纵向拼接。
- block可带自己的 `visual`；没有时用本组的原画面。教学或多说话人场景，选择各段实际对应的画面。
- `role`为speaker、chart、demonstration或scene；只有speaker使用下沿渐隐，其余保留完整画面。
- `time`必须在相应字幕时间内；若画面对应同一观点的另一句，使用 `visual.evidence`明确引用。`reason`只用于内部核对，不显示在图片上。
- 源字幕、时间与选图理由保存在中间文件，默认不印到成品上。对照音频修正识别错误时记录依据，保留原转写。
- 片段内需要去掉口语铺垫时，可在block添加 `"excerpts": {"s0012": "原句中的连续文字"}`。键必须已在本block的evidence中，值必须是原字幕的非空连续子串；省略不能改变条件、否定或原意。未指定时显示整段。原句与摘选分别留在evidence.json，不能把摘选伪装成识别纠错。

`frames.json`的selected只能选已提取的实际候选。看图检查后再生成。`cards.json`是当前成品清单。字幕长则增加图片高度，不靠重写字幕减少长度。
