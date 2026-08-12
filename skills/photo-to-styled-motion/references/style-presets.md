# Style Presets

Use these as prompt modules. Always prepend the input-specific identity, pose, prop, composition, and background invariants.

## `handdrawn-anime-film`

High-fidelity Japanese animated feature-film frame; refined 2D hand drawing; soft variable pencil-and-ink contours; clean cel-painted skin and fabric; watercolor-gouache background texture; subtle film grain; nuanced adult facial acting. Preserve realistic facial proportions and recognizable identity. Avoid named studios/artists, oversized eyes, childlike proportions, 3D, and glossy vector rendering.

Animation: natural breathing, one blink, slight chin/gaze shift, millimetric prop movement, subtle cloth motion, fixed camera, stable linework and color.

Origin: derived from the gallery's style-transfer-selfie hand-drawn animation example plus the anime key-visual template, then adapted for identity-locked image-to-video. It was not originally a standalone gallery preset.

## `90s-cel-animation`

Premium 1990s hand-inked cel animation; confident dark contours; elegant two-step cel shading; hand-painted background; subtle analog grain and registration texture; sophisticated adult character design; restrained palette.

Animation: slow head tilt, one blink, breathing, subtle prop adjustment, gentle practical-light flicker. Avoid modern glossy anime and neon overload.

## `seinen-manga-bw`

Professional black-and-white adult manga splash image; precise likeness; controlled contour variation; feathered shadows; stable halftone screentones; sparse cross-hatching; crisp whites and deep blacks; pure grayscale.

Animation: limited restrained movement. Explicitly require stable screen-tone density with no shimmering or crawling patterns. This preset carries a higher flicker risk in video.

## `cyberpunk-graphic-novel`

High-end color graphic novel; bold clean ink contours; painterly cel shading; selective halftone; realistic adult proportions; cyan edge light and restrained magenta reflection while keeping the face warm and readable. Keep the original location recognizable; do not add armor, implants, or weapons unless requested.

Animation: rain trails, slow reflected-light drift, breathing, one blink, slight head and prop motion.

## `abstract-screenprint-collage`

Experimental editorial screen print, risograph, and cut-paper collage. Simplify the face into asymmetrical geometric planes; hair into jagged shards; clothing into overlapping paper shapes; background into sparse architectural bars, circles, silhouettes, and negative space. Use five dominant inks: warm peach, signal red, cobalt blue, carbon black, and off-white. No gradients or photorealistic skin.

Animation: paper-edge flutter, subtle registration drift, halftone movement, and shape parallax. Prefer graphic motion over realistic blinking. Keep key identity anchors readable.

## Selection guidance

- Best identity fidelity: `handdrawn-anime-film`, `seinen-manga-bw`
- Best general H3 stability: `handdrawn-anime-film`, `90s-cel-animation`
- Strongest scene transformation: `cyberpunk-graphic-novel`
- Least photorealistic: `abstract-screenprint-collage`
- Highest texture-flicker risk: `seinen-manga-bw`, `abstract-screenprint-collage`
