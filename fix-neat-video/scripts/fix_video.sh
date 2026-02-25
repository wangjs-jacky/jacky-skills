#!/bin/bash
# 修复 Neat Download 下载的分段视频文件
# 问题：Neat Download 合并时分段之间插入约 10MB 填充数据，导致播放器只能播放开头部分
# 功能：将 xxx.mp4.ts 修复并转换为 xxx.mp4，处理后删除源文件

set -e

if [ $# -eq 0 ]; then
    echo "用法: $0 <视频文件.mp4.ts>"
    echo "示例: $0 video.mp4.ts"
    exit 1
fi

INPUT="$1"

# 检查文件是否存在
if [ ! -f "$INPUT" ]; then
    echo "错误: 文件不存在: $INPUT"
    exit 1
fi

# 检查文件扩展名
if [[ "$INPUT" != *.mp4.ts ]]; then
    echo "错误: 文件必须是 .mp4.ts 格式"
    exit 1
fi

# 生成输出文件名：xxx.mp4.ts -> xxx.mp4
OUTPUT="${INPUT%.ts}"

echo "正在修复视频文件..."
echo "输入: $INPUT"
echo "输出: $OUTPUT"
echo ""

# 使用 ffmpeg 修复并直接输出为 mp4
ffmpeg -f mpegts \
       -fflags +genpts+discardcorrupt+igndts \
       -err_detect ignore_err \
       -i "$INPUT" \
       -map 0 -c copy \
       -y \
       "$OUTPUT" \
       2>&1 | grep -E "(Duration|Stream|size=)" || true

echo ""

# 检查输出文件是否创建成功
if [ -f "$OUTPUT" ]; then
    # 删除源文件
    rm "$INPUT"
    echo "✓ 修复完成!"
    echo "输出文件: $OUTPUT"
    echo "已删除源文件: $INPUT"
else
    echo "✗ 修复失败，输出文件未生成"
    exit 1
fi
