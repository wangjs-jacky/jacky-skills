---
name: photo-to-styled-motion
description: "Turn a user portrait or photo into identity-preserving visual style candidates, animate a selected candidate with MiniMax H3, and deliver reusable motion outputs: a verified MP4, an optional silent GIF, and an optional Honor-style dynamic JPEG attachment for compatible social media. Use when users ask to transform a photo, selfie, portrait, motion photo, or Live-style image into anime, manga, graphic-novel, abstract, or other gallery-inspired moving media."
---

# Photo To Styled Motion

Produce static candidates first, then animate only user-selected images. Treat MP4 as the universal primary deliverable. Optionally derive a silent GIF and, when an original Honor motion photo is available, an Honor-style dynamic JPEG attachment.

## Required capabilities

- Use the host image generation/editing tool when available. Otherwise use the installed `gpt-image-2` skill according to its mode rules.
- Use the `minimax-h3` executable from `PATH` for MiniMax H3. It must resolve credentials from secure local configuration; never print or persist the key.
- Use `ffmpeg` and `ffprobe` for media conversion and verification.
- In Happy, send every generated PNG/JPEG with `mcp__happy__send_image` and every MP4 with `mcp__happy__send_file`.

## Workflow

### 1. Inspect the input

Use the exact user-provided attachment path. Inspect dimensions, format, identity anchors, pose, visible objects, and background.

If the input may be a motion photo, check for embedded `ftyp`/`moov` data. Extract frames only when useful for reference. Keep the original file when Honor-style dynamic JPEG output may be requested; its vendor metadata and private MP4 `uuid` box are needed for best compatibility.

### 2. Choose styles

Read [references/style-presets.md](references/style-presets.md). Select 3-5 materially different presets that suit the subject. Include `handdrawn-anime-film` for requests mentioning Japanese manga/anime unless the user rules it out.

Generate one standalone image per preset, not a collage, so each candidate can become a video first frame. Preserve identity anchors explicitly:

- face shape and feature spacing
- age, ethnicity, and body proportions
- hairstyle and key accessories
- pose, hand placement, phone/props, and framing
- background layout unless the preset intentionally changes it

Avoid title text, captions, dates, logos, watermarks, extra people, extra fingers, and duplicated props.

Send each passing candidate to the user. Briefly state identity fidelity, animation suitability, and likely stability risks. Let the user select one or more.

### 3. Confirm billable video generation

MiniMax `create` and `create-json` are billable. Before every batch, state:

- number of tasks
- resolution and duration per task
- approximate public price when a current reference is available, explicitly noting the actual invoice controls
- that each selected style gets one submission and no automatic regeneration

Do not submit until the user explicitly confirms the paid calls. A previous confirmation covers only the described batch.

### 4. Build and submit H3 requests

Convert the selected candidate to a high-quality JPEG when inline PNG data would be unnecessarily large.

Use [scripts/build_h3_request.mjs](scripts/build_h3_request.mjs):

```bash
node scripts/build_h3_request.mjs \
  --image candidate.jpg \
  --prompt-file motion-prompt.txt \
  --output request.json \
  --resolution 768P \
  --duration 5 \
  --seed 42
```

Default to one `first_frame` image. Use first/last frames only when the user has approved both exact endpoint images; forcing the same image at both ends can create mechanical loops.

Prompt for restrained motion unless the user asks otherwise: natural breathing, one blink, subtle gaze/head/prop motion, fixed camera, stable identity, hands, glasses, props, linework, and palette. Add preset-specific environmental motion.

Submit exactly once per confirmed style:

```bash
minimax-h3 create-json request.json --confirm-cost
```

Record every task ID. Poll only those IDs. Never create a replacement task automatically after a failure or disappointing result.

### 5. Download and verify MP4

Download a succeeded task with the same CLI. Run:

```bash
node scripts/verify_video.mjs output.mp4
```

Verification must confirm:

- readable MP4 container
- H.264 video stream
- nonzero dimensions and duration
- AAC audio stream by default; use `--allow-silent` only when the user explicitly requested no audio
- full decode succeeds without errors

Inspect a contact sheet for identity, hands, props, black frames, style flicker, and scene drift. Send the MP4 only after verification.

### 6. Optional GIF

Explain before conversion: GIF has no audio, usually has fewer colors, and is typically larger than an efficient MP4 for equivalent motion.

Use [scripts/export_gif.sh](scripts/export_gif.sh):

```bash
scripts/export_gif.sh input.mp4 output.gif 10 480
```

Defaults are 10 fps and 480 px wide. The script uses a two-pass palette workflow. Verify the GIF is animated and nonempty, and report its size beside the MP4 size; GIF is often much larger. In Happy, there is no general binary/GIF attachment channel; provide a download link when cross-device review is required.

### 7. Optional Honor-style dynamic JPEG

This format is useful as an original attachment on compatible social media, even though re-importing the file into Honor Gallery may show only a static image. Describe that limitation precisely; do not call the file universally unsupported.

Requirements:

- an original Honor motion-photo JPEG containing `LivePhoto`, `HiHonor_OfflineData`, an embedded MP4, a private `uuid` box, and a 60-byte footer
- a selected cover JPEG
- the verified final H3 MP4

Build with [scripts/build_honor_motion.mjs](scripts/build_honor_motion.mjs):

```bash
node scripts/build_honor_motion.mjs \
  --original original-honor-motion.jpg \
  --cover selected-cover.jpg \
  --video final.mp4 \
  --output styled-motion.jpg \
  --copy-honor-uuid
```

The script preserves/injects Honor `LivePhoto` metadata, writes `HiHonor_OfflineData`, embeds the H3 MP4, optionally copies the original Honor private `uuid` box, and updates the `LIVE_<length>` footer.

Verify with [scripts/verify_honor_motion.mjs](scripts/verify_honor_motion.mjs). The verifier must extract and decode the embedded MP4 and confirm the footer length.

Do not send this output through an image-rendering channel that recompresses JPEG; recompression removes the trailing video. Deliver it as an untouched binary attachment, ZIP, or verified direct-download link. If the client only supports image display, also show the cover separately, but state that it is only a preview.

## Output policy

- Primary: verified MP4 with audio.
- Optional: Honor-style dynamic JPEG attachment when an original Honor motion photo is available.
- Optional: silent GIF derived from the final MP4.
- Keep prompts and request JSON beside task artifacts for reproducibility.
- Report task IDs, specs, actual usage returned by MiniMax, and whether retries occurred.
- Describe Honor dynamic JPEG compatibility narrowly: it can work as an untouched social-media attachment, but Honor Gallery may not register a re-imported file as dynamic.
