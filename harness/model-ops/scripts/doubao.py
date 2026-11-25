"""迁移的可选豆包适配器；接口沿原实现，未在本轮调用云端。凭据只从授权进程环境接收。"""
from __future__ import annotations
import argparse
import base64
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
from typing import Optional
import uuid
from audio_common import Segment, TranscriptionResult, FORMATTERS, SUPPORTED_INPUTS, write_result

DOUBAO_RESOURCE_IDS = ["volc.seedasr.auc"]


def normalize_path(path):
    return str(Path(path).expanduser().resolve())


def check_doubao_config(cfg):
    return os.environ.get("DOUBAO_APP_ID", ""), os.environ.get("DOUBAO_ACCESS_TOKEN", "")


def print_doubao_guide():
    print("请按 account-pool-ops 取用已授权条目，并仅在业务进程内注入 DOUBAO_APP_ID / DOUBAO_ACCESS_TOKEN")

class DoubaoApiError(Exception):
    """豆包 API 错误，包含诊断信息，不应自动回退"""

    def __init__(self, message: str, diagnosis: list[tuple[str, str, str]] | None = None):
        super().__init__(message)
        self.diagnosis = diagnosis or []

def _try_doubao_standard(
    app_id: str,
    access_token: str,
    audio_data: str,
    audio_format: str,
    language: str | None,
    cfg: dict,
) -> TranscriptionResult | None:
    """
    使用豆包标准版 API（submit + query 轮询，base64 直传）

    API 文档: https://www.volcengine.com/docs/6561/1354868
    - 提交任务（base64 直传） → 轮询查询结果
    - 支持最长 2 小时音频
    """
    import requests as req

    submit_url = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit"
    query_url = "https://openspeech.bytedance.com/api/v3/auc/bigmodel/query"

    # 按优先级尝试标准版 resource_id
    for rid in DOUBAO_RESOURCE_IDS:
        request_id = str(uuid.uuid4())
        headers = {
            "X-Api-App-Key": app_id,
            "X-Api-Access-Key": access_token,
            "X-Api-Resource-Id": rid,
            "X-Api-Request-Id": request_id,
            "X-Api-Sequence": "-1",
        }

        body = {
            "user": {"uid": app_id},
            "audio": {
                "data": audio_data,
                "format": audio_format,
            },
            "request": {
                "model_name": "bigmodel",
                "enable_itn": True,
                "enable_punc": True,
                "enable_ddc": True,
                "show_utterances": True,
            },
        }

        print(f"📡 尝试标准版 {rid}（base64 直传）...")

        # 提交任务
        try:
            resp = req.post(submit_url, json=body, headers=headers, timeout=120)
        except Exception as e:
            print(f"   ❌ 提交请求失败: {type(e).__name__}")
            continue

        status_code = resp.headers.get("X-Api-Status-Code", "")
        message = resp.headers.get("X-Api-Message", "")
        print(f"   提交响应: {status_code} ({message})")

        if status_code == "20000000":
            # 提交成功，轮询查询结果
            print("   ✅ 任务已提交，等待转录完成...")
            query_headers = {
                "X-Api-App-Key": app_id,
                "X-Api-Access-Key": access_token,
                "X-Api-Resource-Id": rid,
                "X-Api-Request-Id": request_id,
            }

            max_wait = 600  # 最长等待 10 分钟
            interval = 5    # 每 5 秒查询一次
            start_time = time.time()

            while time.time() - start_time < max_wait:
                time.sleep(interval)
                try:
                    qresp = req.post(query_url, json={}, headers=query_headers, timeout=60)
                except Exception:
                    continue

                q_status = qresp.headers.get("X-Api-Status-Code", "")
                q_message = qresp.headers.get("X-Api-Message", "")

                if q_status == "20000000":
                    # 转录完成
                    data = qresp.json()
                    result_data = data.get("result", {})
                    utterances = result_data.get("utterances", [])
                    full_text = result_data.get("text", "").strip()
                    duration_ms = data.get("audio_info", {}).get("duration", 0)

                    segments = []
                    for utt in utterances:
                        segments.append(Segment(
                            start=utt.get("start_time", 0) / 1000.0,
                            end=utt.get("end_time", 0) / 1000.0,
                            text=utt.get("text", "").strip(),
                        ))

                    detected_lang = language or "zh"
                    print(f"✅ 转录完成: {len(segments)} 个段落, 时长: {duration_ms/1000:.1f}s")

                    return TranscriptionResult(
                        segments=segments,
                        language=detected_lang,
                        duration=duration_ms / 1000.0,
                        text=full_text,
                    )

                elif q_status in ("20000001", "20000002"):
                    # 正在处理中 / 在队列中
                    elapsed = time.time() - start_time
                    print(f"   ⏳ 处理中... ({elapsed:.0f}s)")
                    continue

                elif q_status == "20000003":
                    # 静音音频
                    print("   ⚠️ 检测到静音音频")
                    return None

                else:
                    print(f"   ❌ 查询失败: {q_status} - {q_message}")
                    break

            print("   ❌ 轮询超时（等待超过 10 分钟）")
            return None

        elif status_code.startswith("45"):
            print(f"   ❌ 不支持: {message}")
            continue

        else:
            print(f"   ❌ 提交失败: {status_code} - {message}")
            continue

    return None

def transcribe_doubao(
    audio_path: str,
    cfg: dict,
    language: Optional[str] = None,
) -> TranscriptionResult:
    """
    使用豆包 ASR API 转录（标准版 submit + query 轮询模式）

    API 文档: https://www.volcengine.com/docs/6561/1354868
    - 提交任务（base64 直传） → 轮询查询结果
    - 支持最长 2 小时音频
    - 返回带时间戳的 utterances，适合生成字幕
    """
    app_id, access_token = check_doubao_config(cfg)

    # 如果没有配置，抛出错误让调用方处理（不自动回退）
    if not app_id or not access_token:
        print("⚠️  豆包 API 凭证未配置\n")
        print_doubao_guide()
        raise DoubaoApiError("缺少授权进程中的豆包凭据；先读取 account-pool-ops，不能读取或新建明文密钥配置")

    try:
        import requests
    except ImportError:
        print("❌ requests 未安装，请运行: pip install requests")
        raise RuntimeError("当前解释器没有安装 requests")

    print("🔊 引擎: 豆包 ASR（标准版）")

    # 转换音频为支持格式
    file_ext = Path(audio_path).suffix.lstrip(".").lower()
    supported_exts = {"wav", "mp3", "ogg", "opus"}

    if file_ext not in supported_exts:
        print("🔄 转换音频为 WAV 格式...")
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_wav = tmp.name
        input_path = normalize_path(audio_path)
        cmd = ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", tmp_wav]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg 转换失败: {result.stderr}")
        upload_path = tmp_wav
        file_ext = "wav"
    else:
        tmp_wav = None
        upload_path = audio_path

    try:
        # Base64 编码音频
        with open(upload_path, "rb") as f:
            audio_data = base64.b64encode(f.read()).decode("utf-8")

        # 直接调用标准版 API
        result = _try_doubao_standard(app_id, access_token, audio_data, file_ext, language, cfg)
        if result:
            return result

        # 标准版失败，抛出错误
        raise DoubaoApiError(
            "豆包 API 标准版不可用。"
            "请检查火山引擎账号的语音识别服务开通情况。\n"
            "开通服务后重新运行即可，或可手动选择回退到本地引擎。",
            diagnosis=[],
        )

    finally:
        if tmp_wav and os.path.exists(tmp_wav):
            os.unlink(tmp_wav)

def main():
    parser = argparse.ArgumentParser(description="Model OPS / 可选豆包云端转写（会上传音频）")
    parser.add_argument("input")
    parser.add_argument("-f", "--format", required=True, choices=tuple(FORMATTERS))
    parser.add_argument("-o", "--output")
    parser.add_argument("-l", "--language")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if args.dry_run:
        print(json.dumps({"input": args.input, "engine": "doubao", "format": args.format, "uploads_audio": True}, ensure_ascii=False))
        return
    source = Path(args.input).expanduser().resolve()
    if not source.is_file() or source.suffix.lower() not in SUPPORTED_INPUTS:
        parser.error("输入音视频不存在或格式不支持")
    try:
        result = transcribe_doubao(str(source), {}, args.language)
        output = write_result(result, str(source), args.output, args.format)
        print(json.dumps({"output": output, "engine": "doubao"}, ensure_ascii=False))
    except Exception as exc:
        print("豆包调用失败: " + type(exc).__name__, file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
