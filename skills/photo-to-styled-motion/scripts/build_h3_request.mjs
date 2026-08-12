#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function fail(message) {
  console.error(`build_h3_request: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const options = {};
for (let index = 0; index < args.length; index += 2) {
  const key = args[index];
  const value = args[index + 1];
  if (!key?.startsWith("--") || value == null) fail(`invalid argument near ${key ?? "end"}`);
  options[key.slice(2)] = value;
}

for (const required of ["image", "prompt-file", "output"]) {
  if (!options[required]) fail(`--${required} is required`);
}

const imagePath = path.resolve(options.image);
const promptPath = path.resolve(options["prompt-file"]);
const outputPath = path.resolve(options.output);
if (!fs.existsSync(imagePath)) fail(`image not found: ${imagePath}`);
if (!fs.existsSync(promptPath)) fail(`prompt file not found: ${promptPath}`);

const extension = path.extname(imagePath).toLowerCase();
const mimeType = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
const prompt = fs.readFileSync(promptPath, "utf8").trim();
if (!prompt) fail("prompt is empty");

const resolution = options.resolution ?? "768P";
if (!["768P", "2K"].includes(resolution)) fail("resolution must be 768P or 2K");
const duration = Number(options.duration ?? 5);
if (!Number.isInteger(duration) || duration < 5 || duration > 15) fail("duration must be an integer from 5 to 15");
const seed = Number(options.seed ?? 42);
if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) fail("seed must be from 0 to 4294967295");

const imageData = `data:${mimeType};base64,${fs.readFileSync(imagePath).toString("base64")}`;
const content = [
  {type: "text", text: prompt},
  {type: "image_url", image_url: {url: imageData}, role: "first_frame"},
];

if (options["last-image"]) {
  const lastPath = path.resolve(options["last-image"]);
  if (!fs.existsSync(lastPath)) fail(`last image not found: ${lastPath}`);
  const lastExtension = path.extname(lastPath).toLowerCase();
  const lastMime = lastExtension === ".png" ? "image/png" : lastExtension === ".webp" ? "image/webp" : "image/jpeg";
  const lastData = `data:${lastMime};base64,${fs.readFileSync(lastPath).toString("base64")}`;
  content.push({type: "image_url", image_url: {url: lastData}, role: "last_frame"});
}

const request = {
  model: "MiniMax-H3",
  content,
  resolution,
  duration,
  seed,
  aigc_watermark: false,
};

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, `${JSON.stringify(request, null, 2)}\n`);
console.log(JSON.stringify({output: outputPath, resolution, duration, seed, inputImages: content.length - 1}, null, 2));
