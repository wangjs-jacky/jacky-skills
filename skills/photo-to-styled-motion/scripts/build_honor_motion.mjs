#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function fail(message) {
  console.error(`build_honor_motion: ${message}`);
  process.exit(1);
}

const rawArgs = process.argv.slice(2);
const options = {};
for (let index = 0; index < rawArgs.length; index += 1) {
  const key = rawArgs[index];
  if (!key?.startsWith("--")) fail(`invalid argument: ${key}`);
  if (key === "--copy-honor-uuid") {
    options.copyHonorUuid = true;
    continue;
  }
  const value = rawArgs[index + 1];
  if (value == null || value.startsWith("--")) fail(`${key} requires a value`);
  options[key.slice(2)] = value;
  index += 1;
}

for (const required of ["original", "cover", "video", "output"]) {
  if (!options[required]) fail(`--${required} is required`);
}

const originalPath = path.resolve(options.original);
const coverPath = path.resolve(options.cover);
const videoPath = path.resolve(options.video);
const outputPath = path.resolve(options.output);
for (const file of [originalPath, coverPath, videoPath]) {
  if (!fs.existsSync(file)) fail(`file not found: ${file}`);
}

const original = fs.readFileSync(originalPath);
const cover = fs.readFileSync(coverPath);
const video = fs.readFileSync(videoPath);
const honorMarker = Buffer.from("HiHonor_OfflineData\0", "ascii");

function findLastJpegEnd(buffer) {
  for (let index = buffer.length - 2; index >= 2; index -= 1) {
    if (buffer[index] === 0xff && buffer[index + 1] === 0xd9) return index + 2;
  }
  fail("JPEG end marker not found");
}

function parseMp4Boxes(buffer, start = 0) {
  const boxes = [];
  let offset = start;
  while (offset + 8 <= buffer.length) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    let header = 8;
    if (size === 1) {
      if (offset + 16 > buffer.length) break;
      size = Number(buffer.readBigUInt64BE(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = buffer.length - offset;
    }
    if (!/^[\x20-\x7e]{4}$/.test(type) || size < header || offset + size > buffer.length) break;
    boxes.push({offset, size, type, end: offset + size});
    offset += size;
  }
  return {boxes, end: offset};
}

function livePhotoSegments(buffer, end) {
  const segments = [];
  let offset = 2;
  while (offset + 4 <= end && buffer[offset] === 0xff) {
    const marker = buffer[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = buffer.readUInt16BE(offset + 2);
    const segmentEnd = offset + 2 + length;
    if (length < 2 || segmentEnd > end) break;
    const segment = buffer.subarray(offset, segmentEnd);
    if (marker >= 0xe1 && marker <= 0xef && segment.includes(Buffer.from("LivePhoto", "ascii"))) {
      segments.push(segment);
    }
    offset = segmentEnd;
  }
  return segments;
}

const markerOffset = original.indexOf(honorMarker);
if (markerOffset < 0) fail("original has no HiHonor_OfflineData marker");
if (!original.subarray(0, markerOffset).includes(Buffer.from("LivePhoto", "ascii"))) {
  fail("original has no Honor LivePhoto metadata");
}

const originalMp4Start = markerOffset + honorMarker.length;
const parsedOriginal = parseMp4Boxes(original, originalMp4Start);
if (parsedOriginal.boxes.length === 0 || parsedOriginal.boxes[0].type !== "ftyp") fail("original embedded MP4 is invalid");
const footer = original.subarray(parsedOriginal.end);
if (footer.length !== 60 || !footer.includes(Buffer.from("LIVE_", "ascii"))) {
  fail(`unexpected Honor footer (${footer.length} bytes)`);
}

const coverMarker = cover.indexOf(honorMarker);
const coverEnd = coverMarker >= 0 ? coverMarker : findLastJpegEnd(cover);
let cleanCover = cover.subarray(0, coverEnd);
if (!cleanCover.includes(Buffer.from("LivePhoto", "ascii"))) {
  const segments = livePhotoSegments(original, markerOffset);
  if (segments.length === 0 || cleanCover.subarray(0, 2).toString("hex") !== "ffd8") {
    fail("unable to inject Honor LivePhoto metadata into cover");
  }
  cleanCover = Buffer.concat([cleanCover.subarray(0, 2), ...segments, cleanCover.subarray(2)]);
}

const parsedVideo = parseMp4Boxes(video, 0);
if (parsedVideo.boxes.length === 0 || parsedVideo.boxes[0].type !== "ftyp" || parsedVideo.end !== video.length) {
  fail("input video is not a clean top-level MP4");
}
let outputVideo = video;
let uuidBytes = 0;
if (options.copyHonorUuid) {
  const uuidBox = [...parsedOriginal.boxes].reverse().find((box) => box.type === "uuid");
  if (!uuidBox) fail("original embedded MP4 has no Honor uuid box");
  const uuid = original.subarray(uuidBox.offset, uuidBox.end);
  outputVideo = Buffer.concat([video, uuid]);
  uuidBytes = uuid.length;
}

const liveLength = honorMarker.length + outputVideo.length;
const footerText = footer.toString("ascii");
const liveMatch = footerText.match(/LIVE_\d+/);
if (!liveMatch) fail("Honor footer has no LIVE length field");
const liveValue = `LIVE_${liveLength}`;
if (liveValue.length > liveMatch[0].length) fail("new LIVE length does not fit footer field");
const outputFooter = Buffer.from(footerText.replace(liveMatch[0], liveValue.padEnd(liveMatch[0].length, " ")), "ascii");
const output = Buffer.concat([cleanCover, honorMarker, outputVideo, outputFooter]);

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, output);
console.log(JSON.stringify({
  output: outputPath,
  bytes: output.length,
  coverBytes: cleanCover.length,
  embeddedVideoBytes: video.length,
  honorUuidBytes: uuidBytes,
  liveLength,
  galleryReimportExpected: false,
  socialAttachmentCompatibility: "platform-dependent",
}, null, 2));
