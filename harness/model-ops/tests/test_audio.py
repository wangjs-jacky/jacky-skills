"""沿既有 Python/MLX 子系统验证实际边界，不下载模型或调用云端。"""
from pathlib import Path
import contextlib
import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
import audio_common as audio
import whisper
import doubao


class ModelOpsAudioTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.cache = patch.dict(os.environ, {'HF_HUB_CACHE': str(self.root / 'cache')})
        self.cache.start(); self.addCleanup(self.cache.stop)

    def cache_model(self, model, weights=True):
        parent = self.root / 'cache' / ('models--' + whisper.MLX_MODELS[model].replace('/', '--'))
        snapshot = parent / 'snapshots/abc123'
        snapshot.mkdir(parents=True)
        (snapshot / 'config.json').write_text('{}')
        (parent / 'refs').mkdir()
        (parent / 'refs/main').write_text('abc123')
        if weights: (snapshot / 'weights.safetensors').write_bytes(b'fixture')
        return snapshot

    def result(self):
        return audio.TranscriptionResult([audio.Segment(123.25, 125.5, '样本文字')], 'zh', 125.5, '样本文字')

    def test_catalog_distinguishes_complete_and_partial_cache(self):
        target = self.cache_model('large-v3')
        self.cache_model('large-v3-turbo', weights=False)
        rows = {r['model']:r for r in whisper.model_catalog()['models']}
        self.assertEqual(rows['large-v3']['cache_path'], str(target))
        self.assertTrue(rows['large-v3']['cached'])
        self.assertFalse(rows['large-v3-turbo']['cached'])
        self.assertFalse(rows['medium']['cached'])

    def test_cached_model_uses_local_path_and_preserves_proxy(self):
        target = self.cache_model('large-v3')
        seen = []
        def infer(path, **kwargs):
            seen.append(kwargs)
            return {'segments':[{'start':0,'end':1,'text':'测试'}], 'language':'zh', 'text':'测试'}
        proxy = 'socks5h://fixture.invalid:9000'
        with patch.dict(sys.modules, {'mlx_whisper':types.SimpleNamespace(transcribe=infer)}), patch.dict(os.environ, {'ALL_PROXY':proxy}), contextlib.redirect_stdout(io.StringIO()) as stdout:
            result = whisper.transcribe_local('input.wav', 'large-v3', 'zh')
            self.assertEqual(os.environ['ALL_PROXY'], proxy)
        self.assertEqual(seen[0]['path_or_hf_repo'], str(target))
        self.assertFalse(seen[0]['verbose'])
        self.assertEqual(result.text, '测试')
        self.assertNotIn(proxy, stdout.getvalue())
        self.assertNotIn('4-bit', stdout.getvalue())

    def test_all_output_formats_preserve_text_and_source_timestamps(self):
        result = self.result()
        self.assertIn('00:02:03,250 --> 00:02:05,500', audio.to_srt(result))
        self.assertIn('00:02:03.250 --> 00:02:05.500', audio.to_vtt(result))
        self.assertIn('**2:03** 样本文字', audio.to_md(result))
        self.assertEqual(audio.to_txt(result), '样本文字')

    def test_writes_only_selected_output_and_leaves_input_unchanged(self):
        source = self.root / 'sample.mp4'; source.write_bytes(b'original')
        path = audio.write_result(self.result(), str(source), None, 'md')
        self.assertEqual(Path(path), source.with_suffix('.md'))
        self.assertEqual(source.read_bytes(), b'original')
        self.assertFalse(source.with_suffix('.srt').exists())

    def test_empty_or_invalid_result_does_not_overwrite_existing_output(self):
        source = self.root / 'sample.wav'; source.touch()
        output = source.with_suffix('.md'); output.write_text('previous valid transcript')
        invalid = [audio.TranscriptionResult(), audio.TranscriptionResult([audio.Segment(-1, 2, 'text')], 'zh', 2, 'text')]
        for result in invalid:
            with self.assertRaises(ValueError): audio.write_result(result, str(source), None, 'md')
            self.assertEqual(output.read_text(), 'previous valid transcript')

    def test_dry_run_neither_reads_media_nor_loads_engine(self):
        with patch.object(sys,'argv',['whisper.py','missing.wav','-m','large-v3','-f','md','--dry-run']), patch.object(whisper,'transcribe_local',side_effect=AssertionError), patch.object(whisper,'check_ffmpeg',side_effect=AssertionError), contextlib.redirect_stdout(io.StringIO()) as stdout:
            whisper.main()
        self.assertEqual(json.loads(stdout.getvalue())['model'], 'large-v3')

    def test_missing_parameters_fail_before_engine_or_interaction(self):
        with patch.object(sys,'argv',['whisper.py','input.wav']), patch('builtins.input',side_effect=AssertionError), patch.object(whisper,'check_ffmpeg',side_effect=AssertionError), contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as failure: whisper.main()
        self.assertEqual(failure.exception.code, 2)

    def test_inference_failure_does_not_create_output_or_invoke_cloud(self):
        source = self.root / 'input.wav'; source.touch()
        with patch.object(whisper,'preprocess_audio'), patch.object(whisper,'transcribe_local',side_effect=RuntimeError('local failure')), patch.object(doubao,'transcribe_doubao',side_effect=AssertionError):
            with self.assertRaises(RuntimeError): whisper.transcribe_file(str(source),'large-v3','md')
        self.assertFalse(source.with_suffix('.md').exists())

    def test_batch_continues_and_reports_failure(self):
        for name in ['a.wav','b.mp4']: (self.root/name).touch()
        seen = []
        def transcribe(path,*args):
            seen.append(Path(path).name)
            if Path(path).name=='a.wav': raise RuntimeError('failure')
            return 'done'
        with patch.object(sys,'argv',['whisper.py',str(self.root),'--batch','-m','large-v3','-f','md']), patch.object(whisper,'check_ffmpeg',return_value=True), patch.object(whisper,'transcribe_file',side_effect=transcribe), contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as failure: whisper.main()
        self.assertEqual(seen,['a.wav','b.mp4'])
        self.assertEqual(failure.exception.code,1)

    def test_file_discovery_accepts_uppercase_extension_and_ignores_notes(self):
        for name in ['b.MP4','a.wav','notes.md']: (self.root/name).touch()
        self.assertEqual([Path(p).name for p in audio.find_audio_files(str(self.root))],['a.wav','b.MP4'])

    def test_cloud_dry_run_does_not_read_credentials_or_submit(self):
        with patch.object(sys,'argv',['doubao.py','missing.wav','-f','md','--dry-run']), patch.object(doubao,'check_doubao_config',side_effect=AssertionError), patch.object(doubao,'transcribe_doubao',side_effect=AssertionError), contextlib.redirect_stdout(io.StringIO()) as stdout:
            doubao.main()
        self.assertTrue(json.loads(stdout.getvalue())['uploads_audio'])

    def test_cloud_does_not_consume_legacy_plaintext_credentials(self):
        legacy = self.root / '.audio2subtitle'; legacy.mkdir()
        (legacy/'config.json').write_text('{"doubao":{"app_id":"fixture","access_token":"fixture"}}')
        with patch.dict(os.environ,{'HOME':str(self.root),'DOUBAO_APP_ID':'','DOUBAO_ACCESS_TOKEN':''}), contextlib.redirect_stdout(io.StringIO()):
            with self.assertRaises(doubao.DoubaoApiError): doubao.transcribe_doubao('missing.wav',{})

    def test_qwen_reference_requires_explicit_transcript_before_native_execution(self):
        env = {**os.environ,'MODEL_OPS_PYTHON':sys.executable}
        result = subprocess.run(['bash',str(SCRIPTS/'run.sh'),'qwen3-tts','--model','fixture','--ref_audio','fixture.wav'],env=env,capture_output=True,text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('--ref_text',result.stderr)

    def test_qwen_preserves_native_arguments(self):
        executable = self.root/'fake-python'
        executable.write_text('#!'+sys.executable+'\nimport sys,json\nprint(json.dumps(sys.argv[1:]))\n')
        executable.chmod(0o700)
        env = {**os.environ,'MODEL_OPS_PYTHON':str(executable)}
        result = subprocess.run(['bash',str(SCRIPTS/'run.sh'),'qwen3-tts','--model','model path','--text','测试文字'],env=env,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(json.loads(result.stdout),['-m','mlx_audio.tts.generate','--model','model path','--text','测试文字'])


if __name__=='__main__': unittest.main()
