# Gallery release and OSS hotlink-protection SOP

This maintainer-only SOP covers the public Gallery at
`https://wangjs-jacky.github.io/image-effects/`. It does not apply while executing an
image effect for a user.

## Fixed release contract

- Source of truth: `wangjs-jacky/jacky-skills`, under `skills/image-effects/`.
- Public export: `wangjs-jacky/image-effects`.
- Gallery origin: `https://wangjs-jacky.github.io`.
- OSS bucket: `image-effects-gallery-wangjs-jacky` in `cn-hangzhou`.
- Public preview prefix:
  `https://image-effects-gallery-wangjs-jacky.oss-cn-hangzhou.aliyuncs.com/media/`.
- The bucket ACL stays `private`. Only approved versioned objects under `media/` are
  `public-read`.
- Bucket-level Block Public Access is disabled only because those object-level public
  ACLs are required. Never make the bucket itself public.

Changing any value above is an architecture change. Update
`gallery/gallery-config.mjs`, this SOP, tests, OSS configuration, and the deployed
Gallery together.

## Before release

1. Work from a clean source worktree based on the latest `origin/main`. Do not publish
   from an uncommitted tree.
2. Configure Alibaba Cloud credentials outside the repository. Never paste an
   AccessKey ID, AccessKey secret, signed request, or CLI configuration into an issue,
   pull request, log, or chat.
3. Confirm `ossutil` v2 and the authenticated GitHub CLI are available.
4. Treat an existing `<effect-id>@<version>.<ext>` preview as immutable. If preview
   bytes change, publish a new effect version instead of overwriting the object.
5. Read and save the current bucket controls before changing them:

   ```bash
   ossutil api get-bucket-public-access-block \
     --bucket image-effects-gallery-wangjs-jacky \
     --region cn-hangzhou

   ossutil api get-bucket-referer \
     --bucket image-effects-gallery-wangjs-jacky \
     --region cn-hangzhou \
     --output-format json
   ```

Avoid sharing `ossutil api ... --dry-run` output. It can include signed request
metadata even though it does not apply the change.

## Build and verify the Gallery

Run from the source Skill directory:

```bash
npm ci
npm run build:site
node --test tests/build-gallery.test.mjs tests/gallery-assets.test.mjs tests/gallery-model.test.mjs
node scripts/validate-effects.mjs
git diff --check
```

The release is not ready unless all checks pass and:

- `site-dist/media/` does not exist;
- every production `previewUrl` uses the fixed OSS HTTPS prefix;
- source `gallery/api/library.json` still uses portable `./media/` URLs;
- every referenced OSS object exists, has the expected image MIME type, and is
  `public-read`;
- no non-media object was made public.

Upload only new, reviewed, versioned Gallery previews to the `media/` prefix. After
upload, set `public-read` only on those exact objects. Do not recursively change the
bucket ACL or unrelated prefixes.

## Apply the strict Referer policy

The Gallery uses cross-origin image requests. Browsers commonly send only the source
origin for those requests, so whitelist `https://wangjs-jacky.github.io` rather than
the `/image-effects/` path.

The production policy is:

- whitelist: `https://wangjs-jacky.github.io` and `*.console.aliyun.com`;
- blacklist: empty;
- empty or missing Referer: denied;
- Referer path and query-string truncation: enabled.

Apply the complete configuration atomically. `put-bucket-referer` replaces the
previous configuration; do not omit an existing approved entry accidentally.

```bash
ossutil api put-bucket-referer \
  --bucket image-effects-gallery-wangjs-jacky \
  --region cn-hangzhou \
  --referer-configuration '{"AllowEmptyReferer":"false","AllowTruncateQueryString":"true","TruncatePath":"true","RefererList":{"Referer":["https://wangjs-jacky.github.io","*.console.aliyun.com"]},"RefererBlacklist":{"Referer":[]}}'
```

Read the configuration back and compare every field with the production policy:

```bash
ossutil api get-bucket-referer \
  --bucket image-effects-gallery-wangjs-jacky \
  --region cn-hangzhou \
  --output-format json
```

## Publish from the single canonical source

Maintainers edit only `jacky-skills/skills/image-effects`. A merge to
`jacky-skills/main` that touches this directory triggers
`Sync image-effects downstream repositories`, which performs the following work:

1. validates the canonical Skill and Gallery;
2. exports a clean, hashed snapshot, creates or updates a PR in
   `wangjs-jacky/image-effects`, and squash-merges it;
3. waits for the Gallery OSS publication and Pages deployment to succeed;
4. generates the pinned offline Paws snapshot, creates or updates a PR in
   `wangjs-jacky/happy`, and squash-merges it;
5. waits for the Paws production OTA and Web deployment to succeed.

The automation requires the repository Secret `IMAGE_EFFECTS_DOWNSTREAM_TOKEN` in
`jacky-skills`. Use a fine-grained token limited to Contents and Pull requests write
access for `image-effects` and `happy`; never store the token in repository files or
workflow output.

Downstream PRs are retained as audit records, but the canonical workflow merges them
automatically after its validation gates pass. Do not edit their generated catalog,
Gallery, prompt, or preview files directly. If validation fails, fix the canonical
source and rerun the workflow; never repair a generated downstream branch manually.

After the public PR is merged, `Deploy Gallery to Pages` verifies or uploads only
missing immutable versioned previews, then deploys the Gallery. Configure
`ALIYUN_OSS_ACCESS_KEY_ID` and `ALIYUN_OSS_ACCESS_KEY_SECRET` as repository Secrets in
`image-effects`, using a RAM identity limited to the Gallery bucket. Existing remote
objects are never overwritten: a hash mismatch fails the deployment.

The canonical workflow waits for the OSS publication, Pages deployment, Paws
production OTA, and Paws Web deployment. A merge without all applicable delivery runs
succeeding is reported as a failed downstream release rather than a completed one.

For a local recovery export, use a clean canonical source commit and run:

```bash
node scripts/export-public-repo.mjs --target /absolute/path/to/image-effects
```

## Production acceptance matrix

Choose one published preview URL and verify all four cases:

```bash
IMAGE_URL='https://image-effects-gallery-wangjs-jacky.oss-cn-hangzhou.aliyuncs.com/media/anime-key-visual@1.0.0.png'

# Expected: 200
curl -sS -o /dev/null -w '%{http_code}\n' \
  -e 'https://wangjs-jacky.github.io/image-effects/' "$IMAGE_URL"

# Expected: 200, so OSS console preview remains usable
curl -sS -o /dev/null -w '%{http_code}\n' \
  -e 'https://oss.console.aliyun.com/' "$IMAGE_URL"

# Expected: 403
curl -sS -o /dev/null -w '%{http_code}\n' \
  -e 'https://example.com/stolen.html' "$IMAGE_URL"

# Expected: 403 because strict mode blocks direct access
curl -sS -o /dev/null -w '%{http_code}\n' "$IMAGE_URL"
```

Finally open the production Gallery in a real browser, bypass the image cache, and
confirm:

- the Library contains the expected number of cards;
- every image request uses the OSS host;
- every image completes with positive intrinsic dimensions;
- there are no broken or pending images;
- the mobile layout has no horizontal overflow.

## Failure handling and rollback

If the Gallery breaks immediately after a Referer change, restore compatibility first
by allowing empty Referers while retaining the whitelist:

```bash
ossutil api put-bucket-referer \
  --bucket image-effects-gallery-wangjs-jacky \
  --region cn-hangzhou \
  --referer-configuration '{"AllowEmptyReferer":"true","AllowTruncateQueryString":"true","TruncatePath":"true","RefererList":{"Referer":["https://wangjs-jacky.github.io","*.console.aliyun.com"]},"RefererBlacklist":{"Referer":[]}}'
```

Then inspect the actual browser request or OSS real-time log Referer before tightening
the rule again. Do not guess additional domains.

Referer protection prevents ordinary browser hotlinking but is not authentication:
non-browser clients can forge the header. If stronger enforcement is required, design
signed URLs or another authorization layer instead of expanding this allowlist.

Official references:

- [OSS hotlink protection](https://help.aliyun.com/en/oss/user-guide/hotlink-protection)
- [Configure Referer protection with ossutil](https://help.aliyun.com/en/oss/developer-reference/referer)
