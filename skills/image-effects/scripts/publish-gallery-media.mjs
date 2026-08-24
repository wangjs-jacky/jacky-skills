#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFile = promisify(execFileCallback);
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SKILL_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const DEFAULT_LIBRARY_PATH = path.join(SKILL_ROOT, 'gallery/api/library.json');
const DEFAULT_BUCKET = 'image-effects-gallery-wangjs-jacky';
const DEFAULT_REGION = 'cn-hangzhou';
const CACHE_CONTROL = 'public,max-age=31536000,immutable';

function md5(bytes) {
  return createHash('md5').update(bytes).digest('hex').toUpperCase();
}

function contentType(extension) {
  if (extension === '.png') return 'image/png';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  throw new Error(`Unsupported Gallery media extension: ${extension}`);
}

function normalizeEtag(value) {
  return typeof value === 'string' ? value.replaceAll('"', '').toUpperCase() : '';
}

async function defaultExecOssutil(args) {
  return execFile('aliyun', ['ossutil', ...args], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
}

async function statObject(execOssutil, target, region) {
  try {
    const result = await execOssutil([
      'stat',
      target,
      '--region',
      region,
      '--output-format',
      'json',
    ]);
    return JSON.parse(result.stdout);
  } catch (error) {
    const details = `${error.stderr ?? ''}\n${error.stdout ?? ''}\n${error.message ?? ''}`;
    if (/StatusCode\s*[=:]\s*404|NoSuchKey|not exist/i.test(details)) return null;
    throw error;
  }
}

function assertRemoteObject(remote, record) {
  if (normalizeEtag(remote.Etag ?? remote.ETag) !== record.md5) {
    throw new Error(`Immutable OSS object differs from the reviewed preview: ${record.target}`);
  }
  if ((remote.ACL ?? remote.Acl) !== 'public-read') {
    throw new Error(`Gallery media object is not public-read: ${record.target}`);
  }
  if ((remote['Content-Type'] ?? remote.ContentType) !== record.contentType) {
    throw new Error(`Gallery media object has the wrong Content-Type: ${record.target}`);
  }
  if ((remote['Cache-Control'] ?? remote.CacheControl) !== CACHE_CONTROL) {
    throw new Error(`Gallery media object has the wrong Cache-Control: ${record.target}`);
  }
}

async function buildRecords({ skillRoot, libraryPath, bucket }) {
  const library = JSON.parse(await readFile(libraryPath, 'utf8'));
  if (!Array.isArray(library.effects) || library.effects.length === 0) {
    throw new Error('Gallery library must contain effects');
  }
  const records = [];
  const seenTargets = new Set();
  for (const effect of library.effects) {
    const expectedPrefix = `./media/${effect.ref}.`;
    if (typeof effect.previewUrl !== 'string' || !effect.previewUrl.startsWith(expectedPrefix)) {
      throw new Error(`Unsafe managed preview URL for ${effect.ref}`);
    }
    const fileName = effect.previewUrl.slice('./media/'.length);
    if (!/^[a-z0-9][a-z0-9.@-]*\.(?:jpe?g|png)$/.test(fileName)) {
      throw new Error(`Unsafe Gallery media filename: ${fileName}`);
    }
    const localPath = path.join(skillRoot, 'gallery/media', fileName);
    const bytes = await readFile(localPath);
    const target = `oss://${bucket}/media/${fileName}`;
    if (seenTargets.has(target)) throw new Error(`Duplicate Gallery media target: ${target}`);
    seenTargets.add(target);
    records.push({
      localPath,
      target,
      md5: md5(bytes),
      contentType: contentType(path.extname(fileName).toLowerCase()),
    });
  }
  return records;
}

export async function publishGalleryMedia({
  skillRoot = SKILL_ROOT,
  libraryPath = DEFAULT_LIBRARY_PATH,
  bucket = DEFAULT_BUCKET,
  region = DEFAULT_REGION,
  execOssutil = defaultExecOssutil,
} = {}) {
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(bucket)) throw new Error('Invalid OSS bucket name');
  if (!/^cn-[a-z0-9-]+$/.test(region)) throw new Error('Invalid OSS region');
  const records = await buildRecords({ skillRoot, libraryPath, bucket });
  let uploaded = 0;
  for (const record of records) {
    let remote = await statObject(execOssutil, record.target, region);
    if (remote === null) {
      await execOssutil([
        'cp',
        record.localPath,
        record.target,
        '--region',
        region,
        '--acl',
        'public-read',
        '--cache-control',
        CACHE_CONTROL,
        '--content-type',
        record.contentType,
        '--force',
        '--no-progress',
      ]);
      uploaded += 1;
      remote = await statObject(execOssutil, record.target, region);
      if (remote === null) throw new Error(`Uploaded Gallery media is missing: ${record.target}`);
    }
    assertRemoteObject(remote, record);
  }
  return { verified: records.length, uploaded };
}

async function isMainModule() {
  if (!process.argv[1]) return false;
  return await realpath(process.argv[1]) === await realpath(SCRIPT_PATH);
}

if (await isMainModule()) {
  try {
    const result = await publishGalleryMedia();
    console.log(`Verified ${result.verified} immutable Gallery media objects; uploaded ${result.uploaded}.`);
  } catch (error) {
    console.error(`Gallery media publication failed: ${error.message}`);
    process.exitCode = 1;
  }
}
