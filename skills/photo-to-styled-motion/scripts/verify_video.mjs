#!/usr/bin/env node

import {spawnSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const allowSilent = process.argv.includes("--allow-silent");
if (!input) {
  console.error("Usage: verify_video.mjs input.mp4 [--allow-silent]");
  process.exit(1);
}
const file = path.resolve(input);
if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
  console.error(`verify_video: missing or empty file: ${file}`);
  process.exit(1);
}

const probe = spawnSync("ffprobe", [
  "-v", "error",
  "-show_entries", "format=format_name,duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,duration,sample_rate,channels",
  "-of", "json",
  file,
], {encoding: "utf8"});
if (probe.status !== 0) {
  console.error(probe.stderr);
  process.exit(probe.status ?? 1);
}
const metadata = JSON.parse(probe.stdout);
const video = metadata.streams?.find((stream) => stream.codec_type === "video");
const audio = metadata.streams?.find((stream) => stream.codec_type === "audio");
const duration = Number(metadata.format?.duration ?? video?.duration ?? 0);
const errors = [];
if (!String(metadata.format?.format_name ?? "").includes("mp4")) errors.push("container is not MP4-compatible");
if (!video) errors.push("video stream missing");
if (video && video.codec_name !== "h264") errors.push(`expected H.264 video, got ${video.codec_name}`);
if (video && (!(video.width > 0) || !(video.height > 0))) errors.push("invalid video dimensions");
if (!(duration > 0)) errors.push("invalid duration");
if (!audio && !allowSilent) errors.push("AAC audio stream missing; pass --allow-silent only for an intentionally silent output");
if (audio && audio.codec_name !== "aac") errors.push(`expected AAC audio, got ${audio.codec_name}`);

const decode = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"], {encoding: "utf8"});
if (decode.status !== 0) errors.push(`decode failed: ${decode.stderr.trim()}`);

const result = {
  file,
  valid: errors.length === 0,
  bytes: fs.statSync(file).size,
  duration,
  allowSilent,
  video: video ? {codec: video.codec_name, width: video.width, height: video.height, fps: video.r_frame_rate} : null,
  audio: audio ? {codec: audio.codec_name, sampleRate: audio.sample_rate, channels: audio.channels} : null,
  errors,
};
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
