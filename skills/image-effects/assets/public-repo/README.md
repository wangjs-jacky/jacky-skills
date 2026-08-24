# Image Effects

A growing semantic library of reusable, versioned image-effect cards for AI coding agents, plus a static Gallery for browsing every recipe.

[中文说明](./README_CN.md) · [Gallery](https://wangjs-jacky.github.io/image-effects/)

## Install

```bash
npx skills add wangjs-jacky/image-effects
```

This one installation contains the complete behavior for every card. There is no extra Skill dependency, and the catalog does not include `grade-images` or deterministic color-grading recipes.

## Representative effects

- `healing-anime-scribble-v3@1.0.0` — image input
- `minimal-zine-poster@1.0.0` — text or image input
- `photo-illustration-diptych@1.0.0` — image input
- `photo-illustration-diptych-lakeside@1.0.0` — image input
- `photo-illustration-editorial-echo@1.0.0` — image input, with deterministic layout
- `scene-distillation-zine@1.0.0` — image input
- `scenes-gathered-zine@1.0.0` — image input
- `scenes-gathered-zine-sea@1.0.0` — image input
- `torn-paper-editorial-photo-collage@1.0.0` — image input

Every ref includes an exact version. The Skill will not silently replace an unknown version, so an existing invocation remains stable while later recipes can evolve independently.
Browse the complete generated catalog in [`references/INDEX.md`](./references/INDEX.md) or the Gallery; it includes semantic groups for products, campaigns, infographics, scenes, characters, grids, storyboards, assets, maps, editorial work, portraits, and zines.

## Use

For an image effect, explicitly attach exactly one JPEG or PNG and ask your agent:

```text
Use $image-effects effect healing-anime-scribble-v3@1.0.0 on my uploaded image.
```

Minimal Zine accepts either a non-empty text idea with no image, or one explicitly attached JPEG/PNG with optional art direction:

```text
Use $image-effects effect minimal-zine-poster@1.0.0 with this idea or my uploaded image.
```

The Skill only uses input from the current request. It does not scan attachment directories or previous messages to guess an image.

## How generation works

The Skill resolves the selected card, validates its input contract, and hands the complete recipe to the host's native image-generation or image-editing capability. Image bytes are processed by that host; this repository neither uploads them to an additional service nor provides an online generation backend. Review the host's privacy policy before using sensitive images. Temporary transfer or layout files are cleaned after success or failure.

Editorial Echo requires a two-stage workflow. Before creating an intermediate asset, the Skill checks that the host can both generate an image and render a local HTML/CSS (or equivalent deterministic) layout. Stage A generates only the illustrated motif. Stage B combines that motif with the unchanged source photo and real text into the final page. If either capability is missing, the fallback stops before generation and returns the complete motif prompt, dimensions, copy map, layout plan, and missing-capability explanation; it never presents a motif-only result as a finished poster.

If a host has no compatible image tool for a single-stage effect, the Skill returns a complete copyable prompt and says that no image was generated.

## Gallery, previews, and licensing

The [Gallery](https://wangjs-jacky.github.io/image-effects/) is static: it browses and copies versioned invocations but does not generate images or receive user uploads. All previews were independently generated from fictional, text-only subjects and do not use third-party source imagery. Preview attribution is `wangjs-jacky`, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The root [LICENSE](./LICENSE) covers only original code and adaptations in this repository and does not relicense third-party material. Full pinned upstream authorship, source revisions, file hashes, license links, adaptation notes, and MIT notices are preserved in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## Contributing an effect

The canonical source is `wangjs-jacky/jacky-skills/skills/image-effects`. Submit effect
changes there. Merges automatically create or update the generated public-repository
and Paws snapshot pull requests; do not hand-edit generated downstream catalog files.

1. Add one versioned card under `references/effects/` with complete provenance and license fields.
2. Add a metadata-free JPEG or PNG preview under `assets/previews/`.
3. Run the Gallery build and effect validation commands documented by the Skill package.
4. Review the generated index, Gallery data, preview, source copy, and third-party notice before opening a pull request.

Do not hand-edit generated Gallery files or `THIRD_PARTY_NOTICES.md`.
The exported repository keeps `THIRD_PARTY_NOTICES.header.md` at its root so a clean checkout can rebuild and test the notice output without source-only files.
Maintainers must follow the [Gallery release and OSS hotlink-protection SOP](./references/release-sop.md) for the two-repository release, Pages verification, strict Referer policy, and rollback procedure.
