"""只选择既有解释器与执行入口；模型能力仍由对应适配器或原生工具提供。"""
from __future__ import annotations
import json
import os
from pathlib import Path
import sys

ROUTES = {"whisper": "whisper.py", "doubao": "doubao.py", "qwen3-tts": None}


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print("用法: bash scripts/run.sh {whisper|qwen3-tts|doubao} [模型原生参数]\n"
              "whisper: 转写工具；qwen3-tts: MLX-Audio 原生生成器；doubao: 显式云端调用")
        return
    family, *parameters = args
    if family not in ROUTES:
        raise SystemExit("该入口尚无此模型适配器；按 Model OPS 对象档案使用已有工具，不猜测调用协议")
    chosen = os.environ.get("MODEL_OPS_PYTHON")
    runtime = Path(__file__).resolve().parents[1] / "local/runtime.json"
    if not chosen and runtime.exists():
        try:
            config = json.loads(runtime.read_text())
            if config.get("version") != 1 or not isinstance(config.get("interpreters"), dict):
                raise ValueError("unsupported runtime configuration")
            chosen = config["interpreters"].get(family)
            if chosen is not None and not isinstance(chosen, str):
                raise ValueError("invalid interpreter path")
        except (OSError, ValueError, AttributeError) as exc:
            raise SystemExit("Model OPS 运行环境配置无效；修复 local/runtime.json 后重试") from exc
    python = Path(chosen or sys.executable).expanduser()
    if not python.is_absolute() or not python.is_file() or not os.access(python, os.X_OK):
        raise SystemExit("模型解释器不存在或不可执行；核对 MODEL_OPS_PYTHON 或本机 runtime.json")
    if family == "qwen3-tts":
        if "--doctor" in parameters:
            if parameters != ["--doctor"]:
                raise SystemExit("--doctor 是独立环境检查，不与生成参数混用")
            code = (
                "import sys,json,platform; import mlx_audio; import mlx.core as mx; "
                "ready=mx.metal.is_available(); "
                "print(json.dumps(dict(python=sys.executable,python_version=platform.python_version(),mlx_audio=True,metal=ready))); "
                "sys.exit(0 if ready else 1)"
            )
            os.execv(str(python), [str(python), "-c", code])
        def present(flag):
            return any(value == flag or value.startswith(flag + "=") for value in parameters)
        if not present("--help") and present("--ref_audio") and not present("--ref_text"):
            raise SystemExit("参考配音需要明确 --ref_text；从 Voice Material OPS 取得逐字稿，不隐式加载另一个识别模型")
        command = [str(python), "-m", "mlx_audio.tts.generate", *parameters]
    else:
        command = [str(python), str(Path(__file__).resolve().parent / ROUTES[family]), *parameters]
    os.execv(str(python), command)


if __name__ == "__main__":
    main()
