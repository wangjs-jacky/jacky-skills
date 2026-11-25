"""音频辅助工具；沿用 Python ASR 生态，供模型操作复用，不保存模型或个人偏好。"""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
import math
import os
import subprocess
import tempfile

@dataclass
class Segment:
    """字幕段落"""
    start: float  # 秒
    end: float    # 秒
    text: str

@dataclass
class TranscriptionResult:
    """转录结果"""
    segments: list[Segment] = field(default_factory=list)
    language: str = ""
    duration: float = 0.0
    text: str = ""

def normalize_path(path: str) -> str:
    """规范化文件路径，处理特殊字符

    subprocess.run 列表形式会自动处理特殊字符，无需手动加引号。
    此函数主要用于将相对路径转换为绝对路径。

    Args:
        path: 输入路径

    Returns:
        规范化后的绝对路径
    """
    return os.path.abspath(os.path.expanduser(path))

def check_ffmpeg() -> bool:
    """检查 ffmpeg 是否可用"""
    try:
        subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            check=True,
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def preprocess_audio(input_path: str, output_path: str) -> None:
    """使用 ffmpeg 将音频/视频转为 WAV 16kHz 单声道"""
    input_path = normalize_path(input_path)
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        "-f", "wav",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg 预处理失败: {result.stderr}")

def format_srt_time(seconds: float) -> str:
    """格式化为 SRT 时间戳: 00:00:00,000"""
    total_seconds = int(seconds)
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def format_vtt_time(seconds: float) -> str:
    """格式化为 VTT 时间戳: 00:00:00.000"""
    total_seconds = int(seconds)
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

def format_md_time(seconds: float) -> str:
    """格式化为可读时间: 1:23"""
    minutes = int(seconds) // 60
    secs = int(seconds) % 60
    return f"{minutes}:{secs:02d}"

def to_srt(result: TranscriptionResult) -> str:
    """生成 SRT 格式字幕"""
    lines = []
    for i, seg in enumerate(result.segments, 1):
        if not seg.text:
            continue
        lines.append(str(i))
        lines.append(f"{format_srt_time(seg.start)} --> {format_srt_time(seg.end)}")
        lines.append(seg.text)
        lines.append("")
    return "\n".join(lines)

def to_vtt(result: TranscriptionResult) -> str:
    """生成 VTT 格式字幕"""
    lines = ["WEBVTT", ""]
    for seg in result.segments:
        if not seg.text:
            continue
        lines.append(f"{format_vtt_time(seg.start)} --> {format_vtt_time(seg.end)}")
        lines.append(seg.text)
        lines.append("")
    return "\n".join(lines)

def to_txt(result: TranscriptionResult) -> str:
    """生成纯文本"""
    return result.text

def to_md(result: TranscriptionResult) -> str:
    """生成 Markdown（带时间轴）"""
    lines = [
        "# 音频转录",
        "",
        f"> 时长: {int(result.duration // 60)}分{int(result.duration % 60)}秒",
        f"> 语言: {result.language}",
        f"> 段落: {len(result.segments)}",
        "",
        "## 文案内容",
        "",
        result.text,
        "",
        "## 时间轴",
        "",
    ]
    for seg in result.segments:
        timestamp = format_md_time(seg.start)
        lines.append(f"- **{timestamp}** {seg.text}")
    return "\n".join(lines)

def get_output_path(input_path: str, output_dir: Optional[str], fmt: str) -> str:
    """根据输入文件路径生成输出文件路径"""
    stem = Path(input_path).stem
    ext = f".{fmt}" if fmt != "md" else ".md"
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        return os.path.join(output_dir, f"{stem}{ext}")
    return str(Path(input_path).parent / f"{stem}{ext}")

def find_audio_files(directory: str) -> list[str]:
    """扫描目录中的所有音频文件"""
    files = []
    for f in sorted(Path(directory).iterdir()):
        if f.suffix.lower() in SUPPORTED_INPUTS:
            files.append(str(f))
    return files

FORMATTERS = {"srt": to_srt, "vtt": to_vtt, "txt": to_txt, "md": to_md}
SUPPORTED_INPUTS = {".mp3", ".wav", ".m4a", ".flac", ".aac", ".ogg", ".wma", ".opus", ".mp4", ".mkv", ".avi", ".mov", ".webm", ".ts", ".flv"}


def write_result(result: TranscriptionResult, input_path: str, output_dir: Optional[str], fmt: str) -> str:
    """只写所选格式，识别失败或空结果不制造成功文件。"""
    if not result.text.strip() and not any(s.text.strip() for s in result.segments):
        raise ValueError("未识别到可输出的文字")
    for segment in result.segments:
        if not (math.isfinite(segment.start) and math.isfinite(segment.end) and 0 <= segment.start <= segment.end):
            raise ValueError("转写时间轴包含无效时间")
    if fmt in ("srt", "vtt", "md") and not any(s.text.strip() for s in result.segments):
        raise ValueError("所选输出需要分段时间轴，但模型没有返回分段")
    path = Path(get_output_path(input_path, output_dir, fmt))
    content = FORMATTERS[fmt](result)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, prefix=".transcript-", delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(content)
        os.replace(temporary, path)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()
    return str(path)
