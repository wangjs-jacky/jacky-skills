"""Whisper 转写适配器：只处理模型调用与音频结果，不承担场景分类或凭据管理。"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import platform
import re
import shutil
import sys
import tempfile
from typing import Optional
from audio_common import Segment, TranscriptionResult, FORMATTERS, SUPPORTED_INPUTS, check_ffmpeg, preprocess_audio, find_audio_files, write_result

MLX_MODELS = {'large-v3-turbo': 'mlx-community/whisper-large-v3-turbo', 'large-v3': 'mlx-community/whisper-large-v3-mlx', 'medium': 'mlx-community/whisper-medium-mlx', 'small': 'mlx-community/whisper-small-mlx', 'base': 'mlx-community/whisper-base-mlx', 'tiny': 'mlx-community/whisper-tiny-mlx'}

def cached_model_path(model_name: str) -> Optional[Path]:
    """只把配置和完整权重都可读的快照算作已缓存，不联网。"""
    repo = MLX_MODELS[model_name]
    hf_home = Path(os.environ.get("HF_HOME", str(Path.home() / ".cache/huggingface")))
    hub = Path(os.environ.get("HF_HUB_CACHE", os.environ.get("HUGGINGFACE_HUB_CACHE", str(hf_home / "hub"))))
    model_root = hub / ("models--" + repo.replace("/", "--"))
    snapshots = model_root / "snapshots"
    candidates = []
    main_ref = model_root / "refs/main"
    if main_ref.is_file():
        revision = main_ref.read_text().strip()
        if re.fullmatch(r"[a-zA-Z0-9_-]+", revision):
            candidates.append(snapshots / revision)
    if snapshots.is_dir():
        candidates.extend(sorted(snapshots.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True))
    for candidate in candidates:
        if (candidate / "config.json").is_file() and any(
            (candidate / name).is_file() and (candidate / name).stat().st_size > 0
            for name in ("weights.npz", "weights.safetensors")
        ):
            return candidate
    return None

def model_catalog() -> dict:
    models = []
    for name, repo in MLX_MODELS.items():
        cached = cached_model_path(name)
        models.append({"model": name, "repository": repo,
                       "cached": cached is not None,
                       "cache_path": str(cached) if cached else None})
    return {"engine": "local", "implementation": "MLX-Whisper", "models": models}

def diagnose_local_runtime() -> dict:
    """检查实际解释器和依赖；不读凭据、不下载、不载入识别权重。"""
    report = {"python": sys.executable, "python_version": platform.python_version(),
              "system": platform.system(), "architecture": platform.machine(),
              "ffmpeg": shutil.which("ffmpeg"), "mlx_whisper": False, "metal": False}
    try:
        import mlx_whisper
        import mlx.core as mx
        report["mlx_whisper"] = True
        report["metal"] = bool(mx.metal.is_available())
    except Exception as exc:
        report["dependency_error"] = type(exc).__name__
    report["ready"] = bool(report["ffmpeg"] and report["mlx_whisper"] and report["metal"])
    return report

def transcribe_local(
    audio_path: str,
    model_name: str,
    language: Optional[str] = None,
    verbose: bool = False,
) -> TranscriptionResult:
    """使用 MLX-Whisper 本地转录"""
    try:
        import mlx_whisper
    except ImportError:
        print("❌ mlx-whisper 未安装，请运行: pip install mlx-whisper")
        raise RuntimeError("当前解释器没有安装 mlx-whisper")

    model_repo = MLX_MODELS.get(model_name)
    if not model_repo:
        print(f"❌ 未知模型: {model_name}")
        print(f"   可选模型: {', '.join(MLX_MODELS.keys())}")
        raise ValueError("未知 Whisper 型号")

    print(f"🔊 模型: {model_name} ({model_repo})")
    cached = cached_model_path(model_name)
    if cached:
        print("📦 使用本地缓存权重")
    print(f"🌐 语言: {language or '自动检测'}")
    print("⏳ 开始转录...")

    transcribe_kwargs = {
        "path_or_hf_repo": str(cached) if cached else model_repo,
        "verbose": verbose,
    }
    if language:
        transcribe_kwargs["language"] = language

    try:
        result = mlx_whisper.transcribe(audio_path, **transcribe_kwargs)
    except Exception as e:
        error_name = e.__class__.__name__
        error_msg = str(e)
        if (
            "LocalEntryNotFoundError" in error_name
            or "ConnectTimeout" in error_name
            or "timed out" in error_msg.lower()
        ):
            raise RuntimeError(
                "下载 MLX 模型失败（网络超时或离线）。请检查网络后重试，"
                "或提前缓存模型。"
            ) from e
        raise RuntimeError(f"本地转录失败: {error_name}: {error_msg}") from e

    segments = []
    for seg in result.get("segments", []):
        segments.append(Segment(
            start=seg["start"],
            end=seg["end"],
            text=seg["text"].strip(),
        ))

    full_text = result.get("text", "").strip()
    detected_lang = result.get("language", language or "unknown")

    print(f"✅ 转录完成: {len(segments)} 个段落, 检测语言: {detected_lang}")

    return TranscriptionResult(
        segments=segments,
        language=detected_lang,
        duration=segments[-1].end if segments else 0,
        text=full_text,
    )

def transcribe_file(input_path, model, fmt, language=None, output_dir=None, verbose=False):
    source = Path(input_path).expanduser().resolve()
    if not source.is_file():
        raise ValueError("输入音视频文件不存在")
    if source.suffix.lower() not in SUPPORTED_INPUTS:
        raise ValueError("不支持的音视频格式: " + source.suffix)
    with tempfile.TemporaryDirectory(prefix="model-ops-whisper-") as temporary:
        wav = str(Path(temporary) / "input.wav")
        preprocess_audio(str(source), wav)
        result = transcribe_local(wav, model, language, verbose)
    output = write_result(result, str(source), output_dir, fmt)
    print(json.dumps({"output": output, "engine": "mlx-whisper", "model": model,
                      "language": result.language, "segments": len(result.segments), "duration": result.duration}, ensure_ascii=False))
    return output


def main():
    parser = argparse.ArgumentParser(description="Model OPS / Whisper：音视频转文字和字幕")
    parser.add_argument("input", nargs="?")
    parser.add_argument("-m", "--model", choices=tuple(MLX_MODELS))
    parser.add_argument("-f", "--format", choices=tuple(FORMATTERS))
    parser.add_argument("-l", "--language", default="auto")
    parser.add_argument("-o", "--output", help="输出目录；默认原文件旁")
    parser.add_argument("--batch", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--list-models", action="store_true")
    mode.add_argument("--doctor", action="store_true")
    mode.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if args.list_models:
        print(json.dumps(model_catalog(), ensure_ascii=False, indent=2)); return
    if args.doctor:
        report = diagnose_local_runtime()
        print(json.dumps(report, ensure_ascii=False, indent=2))
        raise SystemExit(0 if report["ready"] else 1)
    if not args.input or not args.model or not args.format:
        parser.error("转写需要 input、--model 与 --format；个人已确认选择由 Agent 读取后明确传入")
    language = None if args.language == "auto" else args.language
    if args.dry_run:
        print(json.dumps({"input": args.input, "engine": "mlx-whisper", "model": args.model,
                          "format": args.format, "language": language, "batch": args.batch}, ensure_ascii=False, indent=2))
        return
    if not check_ffmpeg():
        parser.error("ffmpeg 不可用；先按当前机器环境修复")
    if args.batch:
        if not Path(args.input).is_dir():
            parser.error("--batch 需要输入目录")
        files = find_audio_files(args.input)
        if not files:
            parser.error("目录中没有支持的音视频")
    else:
        files = [args.input]
    failed = 0
    for source in files:
        try:
            transcribe_file(source, args.model, args.format, language, args.output, args.verbose)
        except Exception as exc:
            failed += 1
            print("转写失败: " + str(exc), file=sys.stderr)
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
