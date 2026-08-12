#!/usr/bin/env node

import {spawnSync} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: verify_honor_motion.mjs input.jpg");
  process.exit(1);
}
const file = path.resolve(input);
const errors = [];
if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
  console.error(`verify_honor_motion: missing or empty file: ${file}`);
  process.exit(1);
}
const buffer = fs.readFileSync(file);
const marker = Buffer.from("HiHonor_OfflineData\0", "ascii");
const markerOffset = buffer.indexOf(marker);
if (markerOffset < 0) errors.push("HiHonor_OfflineData marker missing");
if (!buffer.subarray(0, Math.max(markerOffset, 0)).includes(Buffer.from("LivePhoto", "ascii"))) {
  errors.push("Honor LivePhoto metadata missing");
}

let parsedEnd = markerOffset >= 0 ? markerOffset + marker.length : 0;
const boxes = [];
while (parsedEnd + 8 <= buffer.length) {
  let size = buffer.readUInt32BE(parsedEnd);
  const type = buffer.subarray(parsedEnd + 4, parsedEnd + 8).toString("ascii");
  let header = 8;
  if (size === 1) {
    if (parsedEnd + 16 > buffer.length) break;
    size = Number(buffer.readBigUInt64BE(parsedEnd + 8));
    header = 16;
  } else if (size === 0) {
    size = buffer.length - parsedEnd;
  }
  if (!/^[\x20-\x7e]{4}$/.test(type) || size < header || parsedEnd + size > buffer.length) break;
  boxes.push({offset: parsedEnd, size, type});
  parsedEnd += size;
}
if (boxes.length === 0 || boxes[0].type !== "ftyp") errors.push("embedded MP4 is invalid");

const footer = buffer.subarray(parsedEnd);
const footerText = footer.toString("ascii");
const liveMatch = footerText.match(/LIVE_(\d+)/);
if (footer.length !== 60) errors.push(`expected 60-byte Honor footer, got ${footer.length}`);
if (!liveMatch) errors.push("LIVE length field missing");
const expectedLiveLength = markerOffset >= 0 ? parsedEnd - markerOffset : 0;
if (liveMatch && Number(liveMatch[1]) !== expectedLiveLength) {
  errors.push(`LIVE length ${liveMatch[1]} does not match ${expectedLiveLength}`);
}

let videoMetadata = null;
if (markerOffset >= 0 && parsedEnd > markerOffset + marker.length) {
  const cleanVideoEnd = boxes.find((box) => box.type === "uuid")?.offset ?? parsedEnd;
  const temp = path.join(os.tmpdir(), `verify-honor-motion-${process.pid}.mp4`);
  try {
    fs.writeFileSync(temp, buffer.subarray(markerOffset + marker.length, cleanVideoEnd));
    const probe = spawnSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=format_name,duration,size:stream=codec_name,codec_type,width,height",
      "-of", "json",
      temp,
    ], {encoding: "utf8"});
    if (probe.status !== 0) {
      errors.push(`embedded MP4 probe failed: ${probe.stderr.trim()}`);
    } else {
      videoMetadata = JSON.parse(probe.stdout);
      const video = videoMetadata.streams?.find((stream) => stream.codec_type === "video");
      const audio = videoMetadata.streams?.find((stream) => stream.codec_type === "audio");
      if (video?.codec_name !== "h264") errors.push(`expected H.264 video, got ${video?.codec_name ?? "none"}`);
      if (audio?.codec_name !== "aac") errors.push(`expected AAC audio, got ${audio?.codec_name ?? "none"}`);
      const decode = spawnSync("ffmpeg", ["-v", "error", "-i", temp, "-f", "null", "-"], {encoding: "utf8"});
      if (decode.status !== 0) errors.push(`embedded MP4 decode failed: ${decode.stderr.trim()}`);
    }
  } finally {
    fs.rmSync(temp, {force: true});
  }
}

console.log(JSON.stringify({
  file,
  valid: errors.length === 0,
  bytes: buffer.length,
  markerOffset,
  boxes: boxes.map(({size, type}) => ({type, size})),
  footerBytes: footer.length,
  liveLength: liveMatch ? Number(liveMatch[1]) : null,
  embeddedVideo: videoMetadata,
  errors,
}, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
